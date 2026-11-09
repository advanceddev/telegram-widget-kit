import { ref, type Ref } from 'vue';

import { assembleWidget, evaluateSizeVerdict } from '@/core/assemble';
import { createBuildPipeline, type BuildPipeline } from '@/services/build-service';
import { usePreview } from './use-preview';
import { useWidgetSources } from './use-widget-sources';
import type { LintIssue, SizeReport, SizeVerdict, WidgetScheme } from '@/model/widget';

/**
 * Build pipeline state: lint feedback, size accounting and the built
 * artifacts. Consumes the widget sources; writes the finished preview
 * document into the preview composable (one-way data flow).
 */

export interface BuildApi {
  readonly lintIssues: Ref<LintIssue[]>;
  /** Size report of the current sources (assembled, not minified). */
  readonly sizeReport: Ref<SizeReport | null>;
  readonly sizeVerdict: Ref<SizeVerdict | null>;
  readonly hasBuild: Ref<boolean>;
  /** Minified output of the last build. */
  readonly builtMinified: Ref<string>;
  /** Size meta of the last build, shown in the preview bar. */
  readonly builtMeta: Ref<SizeReport | null>;
  readonly building: Ref<boolean>;
  /** Lint + size feedback for the current sources (debounced by the caller). */
  refreshChecks(): Promise<void>;
  /** Full build; refreshes the preview iframe. Resolves `true` on success. */
  build(scheme: WidgetScheme): Promise<boolean>;
  /** Drops in-flight measurements (used when state is replaced wholesale). */
  invalidate(): void;
}

export function createBuild(pipeline: BuildPipeline = createBuildPipeline()): BuildApi {
  const sources = useWidgetSources();
  const preview = usePreview();

  const lintIssues = ref<LintIssue[]>([]);
  const sizeReport = ref<SizeReport | null>(null);
  const sizeVerdict = ref<SizeVerdict | null>(null);
  const hasBuild = ref(false);
  const builtMinified = ref('');
  const builtMeta = ref<SizeReport | null>(null);
  const building = ref(false);

  return {
    lintIssues,
    sizeReport,
    sizeVerdict,
    hasBuild,
    builtMinified,
    builtMeta,
    building,

    async refreshChecks(): Promise<void> {
      lintIssues.value = pipeline.lint(sources.state);
      const report = await pipeline.measure(assembleWidget(sources.state));
      if (report === null) {
        return; // superseded — a newer check is already in flight
      }
      sizeReport.value = report;
      sizeVerdict.value = evaluateSizeVerdict(report, false);
    },

    async build(scheme: WidgetScheme): Promise<boolean> {
      building.value = true;
      try {
        // Fresh lint on every build, as the original tool did.
        lintIssues.value = pipeline.lint(sources.state);
        const result = await pipeline.build(sources.state);
        if (result === null) {
          return false;
        }
        builtMinified.value = result.minified;
        builtMeta.value = result.report;
        sizeReport.value = result.report;
        sizeVerdict.value = result.verdict;
        hasBuild.value = true;
        sources.markClean();
        // Height policy: the bubble keeps its current size until the freshly
        // mounted iframe reports the real content height. Never reset it to
        // the minimum here — when the document is unchanged the iframe does
        // not reload, so no report would arrive and the bubble would stay
        // collapsed (the classic "Build broke the height" bug).
        preview.applyPreviewDocument(pipeline.previewDocument(result.assembled, scheme));
        return true;
      } finally {
        building.value = false;
      }
    },

    invalidate(): void {
      pipeline.invalidate();
    },
  };
}

const singleton = createBuild();

export function useBuild(): BuildApi {
  return singleton;
}
