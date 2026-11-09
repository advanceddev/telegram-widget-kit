<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import BuiltOutput from '@/components/editor/BuiltOutput.vue';
import CodeEditor from '@/components/editor/CodeEditor.vue';
import { useWidgetSources } from '@/composables/use-widget-sources';
import type { EditorTab, SourcePart } from '@/model/widget';

interface TabDefinition {
  id: EditorTab;
  messageKey: string;
}

const SOURCE_TABS: ReadonlyArray<{ id: SourcePart; messageKey: string }> = [
  { id: 'html', messageKey: 'editor.tabHtml' },
  { id: 'css', messageKey: 'editor.tabCss' },
  { id: 'js', messageKey: 'editor.tabJs' },
];

const BUILT_TAB: TabDefinition = { id: 'built', messageKey: 'editor.tabBuilt' };
const ALL_TABS: ReadonlyArray<TabDefinition> = [...SOURCE_TABS, BUILT_TAB];

const { t } = useI18n();
const sources = useWidgetSources();

const activeTab = ref<EditorTab>('html');
const tablist = ref<HTMLElement | null>(null);

function setTab(id: EditorTab): void {
  activeTab.value = id;
}

function onSourceInput(part: SourcePart, value: string): void {
  sources.setSource(part, value);
}

/** Roving focus across the tablist: ←/→/Home/End move selection + focus. */
function onTablistKeydown(event: KeyboardEvent): void {
  const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
  if (!keys.includes(event.key)) {
    return;
  }
  event.preventDefault();

  const current = ALL_TABS.findIndex((tab) => tab.id === activeTab.value);
  let next = current;
  if (event.key === 'ArrowLeft') {
    next = (current - 1 + ALL_TABS.length) % ALL_TABS.length;
  } else if (event.key === 'ArrowRight') {
    next = (current + 1) % ALL_TABS.length;
  } else if (event.key === 'Home') {
    next = 0;
  } else {
    next = ALL_TABS.length - 1;
  }

  setTab(ALL_TABS[next].id);
  const buttons = tablist.value?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
  buttons?.[next]?.focus();
}
</script>

<template>
  <section class="editor-pane">
    <div ref="tablist" class="tabs" role="tablist" @keydown="onTablistKeydown">
      <button
        v-for="tab in ALL_TABS"
        :key="tab.id"
        type="button"
        class="tab"
        :class="{ 'is-active': activeTab === tab.id }"
        role="tab"
        :id="`tab-${tab.id}`"
        :aria-selected="activeTab === tab.id"
        :aria-controls="`panel-${tab.id}`"
        :tabindex="activeTab === tab.id ? 0 : -1"
        @click="setTab(tab.id)"
      >
        {{ t(tab.messageKey) }}
      </button>
    </div>

    <div class="editors">
      <div
        v-for="tab in SOURCE_TABS"
        :key="tab.id"
        v-show="activeTab === tab.id"
        class="editor-panel"
        role="tabpanel"
        :id="`panel-${tab.id}`"
        :aria-labelledby="`tab-${tab.id}`"
      >
        <CodeEditor
          :model-value="sources.state[tab.id]"
          :language="tab.id"
          :active="activeTab === tab.id"
          @update:model-value="(value: string) => onSourceInput(tab.id, value)"
        />
      </div>

      <div
        v-show="activeTab === BUILT_TAB.id"
        class="editor-panel"
        role="tabpanel"
        :id="`panel-${BUILT_TAB.id}`"
        :aria-labelledby="`tab-${BUILT_TAB.id}`"
      >
        <BuiltOutput />
      </div>
    </div>
  </section>
</template>

<style scoped>
.editor-pane {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  height: 100%;
  border-right: 1px solid var(--border);
}

.tabs {
  display: flex;
  background: var(--panel);
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.tab {
  position: relative;
  background: transparent;
  border: none;
  color: var(--muted);
  padding: 10px 16px;
  font-size: 12.5px;
  font-weight: 550;
  cursor: pointer;
  transition: color var(--transition-fast);
}

.tab::after {
  content: '';
  position: absolute;
  left: 12px;
  right: 12px;
  bottom: -1px;
  height: 2px;
  border-radius: 2px;
  background: var(--accent);
  transform: scaleX(0);
  transition: transform var(--transition-fast);
}

.tab:hover {
  color: var(--text);
}

.tab.is-active {
  color: var(--accent);
}

.tab.is-active::after {
  transform: scaleX(1);
}

.editors {
  flex: 1;
  min-height: 0;
  position: relative;
  background: #0d0f14;
}

.editor-panel {
  position: absolute;
  inset: 0;
  overflow: hidden;
}
</style>
