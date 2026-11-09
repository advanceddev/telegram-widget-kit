/**
 * Telegram widget profile 1 limits and playground tuning constants.
 * Sources: widget-sandbox docs (sdk-v1.md §2.11, tgw-format.md), original playground.
 */

/** Raw HTML size limit of a widget payload (32 KB). */
export const RAW_LIMIT = 32_768;

/** zlib level 9 compressed size limit (4 KB). */
export const ZLIB_LIMIT = 4_096;

/** Above this compressed size the UI warns to keep headroom. */
export const ZLIB_WARN_THRESHOLD = 3_800;

/** Fallback deflate estimate ratio when CompressionStream is unavailable. */
export const ZLIB_FALLBACK_RATIO = 0.45;

/** public_data / chat_data payload limit in UTF-8 bytes (tgw-format.md). */
export const TGW_DATA_LIMIT_BYTES = 1_024;

export const BUBBLE_WIDTH_MIN = 200;
export const BUBBLE_WIDTH_MAX = 430;
export const BUBBLE_WIDTH_DEFAULT = 320;

export const WIDGET_HEIGHT_MIN = 50;
export const WIDGET_HEIGHT_MAX = 600;

/** Debounce for lint + size feedback while typing. */
export const DEBOUNCE_CHECK_MS = 220;

/** Debounce for the auto-build pipeline (lint + minify + preview refresh). */
export const DEBOUNCE_AUTOBUILD_MS = 650;

/** Debounce for persisting playground preferences to localStorage. */
export const DEBOUNCE_PERSIST_MS = 400;

/** Auto-dismiss interval for toast notifications. */
export const TOAST_DURATION_MS = 3_800;
export const TOAST_STACK_MAX = 4;

/** Workspace split constraints (editor / preview), as a fraction of 1. */
export const SPLIT_RATIO_MIN = 0.2;
export const SPLIT_RATIO_MAX = 0.8;
/** Mirrors the original 1.15fr / 0.85fr grid. */
export const SPLIT_RATIO_DEFAULT = 0.575;
/** Keyboard step for the accessible split separator. */
export const SPLIT_RATIO_STEP = 0.02;
