import { watch } from 'vue';

import { TEMPLATES } from '@/core/templates/templates';
import { DEBOUNCE_PERSIST_MS } from '@/config/limits';
import { useDebounceFn } from './use-debounce-fn';
import { useBuild } from './use-build';
import { useLocale } from './use-locale';
import { usePreview } from './use-preview';
import { useSettings } from './use-settings';
import { useTgwExport } from './use-tgw-export';
import { useWidgetSources } from './use-widget-sources';
import {
  createDefaultPrefs,
  loadPrefs,
  savePrefs,
  type PersistedPrefs,
} from '@/services/persistence-service';

/**
 * Binds every persisted slice of app state to the versioned preferences
 * store: `restore()` hydrates the singletons before mount, `bind()` installs
 * one debounced writer for the whole snapshot.
 */

export interface PersistenceBinding {
  restore(): void;
  bind(): void;
}

export function usePersistenceBinding(): PersistenceBinding {
  const sources = useWidgetSources();
  const preview = usePreview();
  const settings = useSettings();
  const tgw = useTgwExport();
  const build = useBuild();
  const { locale, setLocale } = useLocale();

  function restore(): void {
    const prefs = loadPrefs();
    if (!prefs) {
      return;
    }
    build.invalidate();

    const { html, css, js, activeTemplate } = prefs.sources;
    const hasTemplate = activeTemplate !== '' && TEMPLATES[activeTemplate] !== undefined;
    if (hasTemplate || html || css || js) {
      sources.hydrate(prefs.sources);
    }

    preview.setScheme(prefs.preview.scheme);
    preview.setWidth(prefs.preview.width);
    settings.setSplitRatio(prefs.settings.splitRatio);
    tgw.patch(prefs.export);
    setLocale(prefs.locale);
  }

  function snapshot(): PersistedPrefs {
    const prefs = createDefaultPrefs();
    prefs.locale = locale.value;
    prefs.sources = {
      html: sources.state.html,
      css: sources.state.css,
      js: sources.state.js,
      activeTemplate: sources.state.activeTemplate,
    };
    prefs.preview = { scheme: preview.scheme.value, width: preview.bubbleWidth.value };
    prefs.settings = {
      splitRatio: settings.splitRatio.value,
    };
    prefs.export = { ...tgw.form };
    return prefs;
  }

  function bind(): void {
    const persist = useDebounceFn(() => savePrefs(snapshot()), DEBOUNCE_PERSIST_MS);

    watch(
      [
        () => sources.state.html,
        () => sources.state.css,
        () => sources.state.js,
        () => sources.state.activeTemplate,
        () => preview.scheme.value,
        () => preview.bubbleWidth.value,
        () => settings.splitRatio.value,
        () => ({ ...tgw.form }),
        locale,
      ],
      persist,
      { deep: true },
    );
  }

  return { restore, bind };
}
