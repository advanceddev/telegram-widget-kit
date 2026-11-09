/**
 * Shared CodeMirror 6 fake for component tests.
 *
 * Reproduces the contract `useCodeEditor` relies on: synchronous dispatch →
 * updateListener, doc replace semantics, destroy(). Referenced from
 * `vi.mock` factories via dynamic import (factory-safe hoisting).
 */

export interface FakeDoc {
  length: number;
  toString(): string;
}

export type FakeUpdateListener = (u: { docChanged: boolean; state: { doc: FakeDoc } }) => void;

export class FakeEditorView {
  doc: string;
  listener: FakeUpdateListener | null = null;
  destroyed = false;

  static updateListener = {
    of: (fn: FakeUpdateListener) => ({ updateListener: fn }),
  };

  /** Real signature: `EditorView.domEventHandlers(handlers)` → Extension. */
  static domEventHandlers = (): unknown[] => [];

  constructor(config: { state: { doc: string; extensions: unknown[] }; parent: unknown }) {
    this.doc = config.state.doc;
    for (const extension of config.state.extensions) {
      const candidate = extension as { updateListener?: FakeUpdateListener };
      if (candidate && typeof candidate.updateListener === 'function') {
        this.listener = candidate.updateListener;
      }
    }
    fakeViewInstances.push(this);
  }

  get state(): { doc: FakeDoc } {
    const doc = this.doc;
    return { doc: { length: doc.length, toString: () => doc } };
  }

  dispatch({ changes }: { changes: { from: number; to: number; insert: string } }): void {
    this.doc = this.doc.slice(0, changes.from) + changes.insert + this.doc.slice(changes.to);
    this.listener?.({ docChanged: true, state: this.state });
  }

  requestMeasure(): void {}
  destroy(): void {
    this.destroyed = true;
  }
}

export const fakeViewInstances: FakeEditorView[] = [];
