import { computed, reactive, type ComputedRef } from 'vue';

import { byteLength } from '@/core/assemble';
import type { TgwFormState, TgwPackage } from '@/model/widget';

/**
 * Export panel state (the bot-side inputMediaWidget fields) plus
 * byte-accurate validation of public_data / chat_data against the 1024-byte
 * wire limit from docs/tgw-format.md.
 */

export interface TgwExportApi {
  readonly form: TgwFormState;
  readonly publicDataBytes: ComputedRef<number>;
  readonly chatDataBytes: ComputedRef<number>;
  patch(patch: Partial<TgwFormState>): void;
  readFromTgw(tgw: TgwPackage): void;
}

export function createTgwExport(): TgwExportApi {
  const form = reactive<TgwFormState>({
    allowQueries: false,
    fwdAllowQueries: false,
    sharedWidget: false,
    width: 0,
    height: 0,
    publicData: '',
    chatData: '',
  });

  const publicDataBytes = computed(() => byteLength(form.publicData));
  const chatDataBytes = computed(() => byteLength(form.chatData));

  return {
    form,
    publicDataBytes,
    chatDataBytes,

    patch(patch: Partial<TgwFormState>): void {
      Object.assign(form, patch);
    },

    readFromTgw(tgw: TgwPackage): void {
      form.allowQueries = tgw.allow_queries === true;
      form.fwdAllowQueries = tgw.fwd_allow_queries === true;
      form.sharedWidget = tgw.shared_widget === true;
      form.width = typeof tgw.width === 'number' ? tgw.width : 0;
      form.height = typeof tgw.height === 'number' ? tgw.height : 0;
      form.publicData = typeof tgw.public_data === 'string' ? tgw.public_data : '';
      form.chatData = typeof tgw.chat_data === 'string' ? tgw.chat_data : '';
    },
  };
}

const singleton = createTgwExport();

export function useTgwExport(): TgwExportApi {
  return singleton;
}
