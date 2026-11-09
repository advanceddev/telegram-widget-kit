<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { useTgwExport } from '@/composables/use-tgw-export';

const { t } = useI18n();
const { form } = useTgwExport();
</script>

<template>
  <details class="tgw-panel">
    <summary>{{ t('export.summary') }}</summary>
    <p class="tgw-note">
      {{ t('export.note') }}
    </p>

    <label class="field row chk">
      <span class="field-label mono">{{ t('export.allowQueries') }}</span>
      <input v-model="form.allowQueries" type="checkbox" />
    </label>

    <label class="field row chk">
      <span class="field-label mono">{{ t('export.fwdAllowQueries') }}</span>
      <input v-model="form.fwdAllowQueries" type="checkbox" />
    </label>

    <label class="field row chk">
      <span class="field-label mono">{{ t('export.sharedWidget') }}</span>
      <input v-model="form.sharedWidget" type="checkbox" />
    </label>

    <label class="field">
      <span class="field-label">{{ t('export.dimensions') }}</span>
      <div class="pair">
        <input v-model.number="form.width" class="field-input" type="number" min="0" max="600" />
        <input v-model.number="form.height" class="field-input" type="number" min="0" max="600" />
      </div>
    </label>

    <label class="field">
      <span class="field-label mono">{{ t('export.publicData') }}</span>
      <textarea
        v-model="form.publicData"
        class="field-input"
        rows="2"
        placeholder='{"q":"…","v":[0,0]}'
      ></textarea>
    </label>

    <label class="field">
      <span class="field-label mono">{{ t('export.chatData') }}</span>
      <textarea
        v-model="form.chatData"
        class="field-input"
        rows="2"
        placeholder='{"best":120}'
      ></textarea>
    </label>
  </details>
</template>

<style scoped>
.tgw-panel {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 8px 10px 10px;
  font-size: 12px;
}

.tgw-panel summary {
  cursor: pointer;
  font-weight: 600;
  color: var(--text);
  list-style: none;
  position: relative;
  padding-right: 18px;
  transition: color var(--transition-fast);
}

.tgw-panel summary:hover {
  color: var(--accent);
}

.tgw-panel summary::-webkit-details-marker {
  display: none;
}

/* animated chevron */
.tgw-panel summary::after {
  content: '';
  position: absolute;
  right: 2px;
  top: 50%;
  width: 6px;
  height: 6px;
  border-right: 1.5px solid var(--muted);
  border-bottom: 1.5px solid var(--muted);
  transform: translateY(-70%) rotate(45deg);
  transition:
    transform var(--transition-fast),
    border-color var(--transition-fast);
}

.tgw-panel[open] summary::after {
  transform: translateY(-30%) rotate(225deg);
  border-color: var(--accent);
}

.tgw-note {
  margin: 8px 0 10px;
  color: var(--muted);
  font-size: 11px;
  line-height: 1.4;
}

.pair {
  display: flex;
  gap: 6px;
}
</style>
