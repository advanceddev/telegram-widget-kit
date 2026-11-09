<script setup lang="ts">
import BrandHeader from '@/components/sidebar/BrandHeader.vue';
import BubbleWidthField from '@/components/sidebar/BubbleWidthField.vue';
import ExportSettingsPanel from '@/components/sidebar/ExportSettingsPanel.vue';
import HintBlock from '@/components/sidebar/HintBlock.vue';
import LintPanel from '@/components/sidebar/LintPanel.vue';
import ActionsPanel from '@/components/sidebar/ActionsPanel.vue';
import SizeStatsPanel from '@/components/sidebar/SizeStatsPanel.vue';
import TemplateField from '@/components/sidebar/TemplateField.vue';
import ThemeField from '@/components/sidebar/ThemeField.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>

<template>
  <aside class="sidebar">
    <BrandHeader />

    <!-- Widget source: template, geometry, chat scheme -->
    <section class="side-section">
      <h2 class="section-title">{{ t('sidebar.sectionSource') }}</h2>
      <TemplateField />
      <BubbleWidthField />
      <ThemeField />
    </section>

    <ExportSettingsPanel />

    <section class="side-section">
      <h2 class="section-title">{{ t('sidebar.sectionChecks') }}</h2>
      <SizeStatsPanel />
      <LintPanel />
    </section>

    <ActionsPanel />

    <HintBlock />
  </aside>
</template>

<style scoped>
.sidebar {
  background: var(--panel);
  border-right: 1px solid var(--border);
  padding: 18px 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
  overflow-x: hidden;
}

.side-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Section caption: uppercase micro-label with a hairline rule */
.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 10.5px;
  font-weight: 650;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
  white-space: nowrap;
  margin-bottom: -2px;
}

.section-title::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border-soft);
}

@media (max-width: 860px) {
  .sidebar {
    border-right: none;
    border-bottom: 1px solid var(--border);
    max-height: 45vh;
  }
}
</style>
