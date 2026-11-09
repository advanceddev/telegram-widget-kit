/**
 * Orchestrates the widget pipeline: lint → assemble → minify → size check →
 * preview document. Framework-free (pure orchestrator over `src/core`), so
 * state composables stay thin and the flow is unit-testable end to end.
 */

import { assembleWidget, createSizeMeasurer, minifyWidget } from '@/core/assemble';
import { evaluateSizeVerdict } from '@/core/assemble';
import { lintWidgetParts } from '@/core/lint';
import { wrapForPreview } from '@/core/mock';
import type { LintIssue, Parts, SizeReport, SizeVerdict, WidgetScheme } from '@/model/widget';

export interface BuildResult {
  /** Self-contained widget document (preview / .html export source). */
  assembled: string;
  /** Minified document (copy / .tgw export source). */
  minified: string;
  report: SizeReport;
  verdict: SizeVerdict;
}

export interface BuildPipeline {
  /** Synchronous profile 1 lint of the three sources. */
  lint(parts: Parts): LintIssue[];
  /**
   * Race-guarded size measurement: returns `null` when a newer measurement
   * (or `invalidate()`) has superseded this one, so stale async results
   * never overwrite fresh state.
   */
  measure(text: string): Promise<SizeReport | null>;
  /** Drops all in-flight measurements (e.g. before applying a restored state). */
  invalidate(): void;
  /** Full build (scheme-independent); resolves `null` when superseded meanwhile. */
  build(parts: Parts): Promise<BuildResult | null>;
  /** Wraps an assembled widget with the SDK mock for the preview iframe. */
  previewDocument(assembled: string, scheme: WidgetScheme): string;
}

export function createBuildPipeline(): BuildPipeline {
  const measurer = createSizeMeasurer();

  return {
    lint(parts) {
      return lintWidgetParts(parts.html, parts.css, parts.js);
    },

    measure(text) {
      return measurer.measure(text);
    },

    invalidate() {
      measurer.reset();
    },

    async build(parts) {
      const assembled = assembleWidget(parts);
      const minified = minifyWidget(assembled);
      const report = await measurer.measure(minified);
      if (report === null) {
        return null; // superseded by a newer build — caller keeps current state
      }
      return { assembled, minified, report, verdict: evaluateSizeVerdict(report, true) };
    },

    previewDocument(assembled, scheme) {
      return wrapForPreview(assembled, scheme);
    },
  };
}
