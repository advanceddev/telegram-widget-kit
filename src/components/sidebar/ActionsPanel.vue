<script setup lang="ts">
import { ref, useTemplateRef } from 'vue';
import { useI18n } from 'vue-i18n';

import { TGW_DATA_LIMIT_BYTES } from '@/config/limits';
import { useBuild } from '@/composables/use-build';
import { useFilePicker } from '@/composables/use-file-picker';
import { useNotifications } from '@/composables/use-notifications';
import { usePreview } from '@/composables/use-preview';
import { useTgwExport } from '@/composables/use-tgw-export';
import { useWidgetSources } from '@/composables/use-widget-sources';
import { parseTgwOrHtml } from '@/core/tgw';
import { buildWidgetTgw, copyTextToClipboard, downloadFile } from '@/services/export-service';

const FILE_INPUT_ACCEPT = '.html,.htm,.tgw,.json,text/html,application/json';
const COPIED_FEEDBACK_MS = 1_200;

const { t } = useI18n();
const sources = useWidgetSources();
const build = useBuild();
const preview = usePreview();
const tgw = useTgwExport();
const notifications = useNotifications();

const fileInput = useTemplateRef<HTMLInputElement>('file-input');
const copied = ref(false);
let copiedTimer: ReturnType<typeof setTimeout> | undefined;

/** Builds first when the current build is missing or outdated. */
async function ensureBuilt(): Promise<void> {
  if (sources.state.dirty || !build.hasBuild.value) {
    await build.build(preview.scheme.value);
  }
}

async function onCopy(): Promise<void> {
  await ensureBuilt();
  const ok = await copyTextToClipboard(build.builtMinified.value);
  if (ok) {
    copied.value = true;
    clearTimeout(copiedTimer);
    copiedTimer = setTimeout(() => (copied.value = false), COPIED_FEEDBACK_MS);
  }
}

async function onDownloadHtml(): Promise<void> {
  await ensureBuilt();
  downloadFile('widget.html', build.builtMinified.value, 'text/html;charset=utf-8');
}

async function onExportTgw(): Promise<void> {
  await ensureBuilt();

  const publicBytes = tgw.publicDataBytes.value;
  if (publicBytes > TGW_DATA_LIMIT_BYTES) {
    notifications.notifyError(
      t('toast.publicDataTooBig', { limit: TGW_DATA_LIMIT_BYTES, size: publicBytes }),
    );
    return;
  }

  const chatBytes = tgw.chatDataBytes.value;
  if (chatBytes > TGW_DATA_LIMIT_BYTES) {
    notifications.notifyError(
      t('toast.chatDataTooBig', { limit: TGW_DATA_LIMIT_BYTES, size: chatBytes }),
    );
    return;
  }

  const pkg = buildWidgetTgw(build.builtMinified.value, tgw.form);
  downloadFile('widget.tgw', JSON.stringify(pkg, null, 2), 'application/json;charset=utf-8');
}

function onOpenFile(): void {
  fileInput.value?.click();
}

const picker = useFilePicker({
  onFile: async (text, filename) => {
    try {
      const { parts, tgw: packageData } = parseTgwOrHtml(text, filename);
      sources.replaceSources(parts);
      if (packageData) {
        tgw.readFromTgw(packageData);
      }
      notifications.notifySuccess(t('toast.fileOpened', { name: filename }));
      await build.build(preview.scheme.value);
    } catch (error) {
      notifications.notifyError(
        t('toast.openError', {
          message: error instanceof Error ? error.message : String(error),
        }),
      );
    }
  },
  onError: (message) => {
    notifications.notifyError(t('toast.openError', { message }));
  },
});
</script>

<template>
  <div class="actions">
    <button type="button" class="btn btn-primary" @click="onCopy">
      {{ copied ? t('actions.copied') : t('actions.copy') }}
    </button>
    <div class="actions-grid">
      <button type="button" class="btn" @click="onDownloadHtml">
        {{ t('actions.downloadHtml') }}
      </button>
      <button type="button" class="btn" @click="onExportTgw">
        {{ t('actions.downloadTgw') }}
      </button>
    </div>
    <button type="button" class="btn" @click="onOpenFile">{{ t('actions.open') }}</button>
    <input
      ref="file-input"
      type="file"
      :accept="FILE_INPUT_ACCEPT"
      hidden
      @change="picker.onChange"
    />
  </div>
</template>

<style scoped>
.actions {
  display: flex;
  flex-direction: column;
  gap: 7px;
  margin-top: auto;
}

.actions-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 7px;
}

/* Half-width buttons: tighter chrome so «Скачать .html / .tgw» always fit. */
.actions-grid .btn {
  padding-inline: 6px;
  font-size: 12px;
}
</style>
