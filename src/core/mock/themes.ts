import type { ThemeParams, ColorScheme } from '@/model/telegram';

/** Reference palettes of an incoming bubble in dark and light chats. */
export const THEME_PARAMS: Record<ColorScheme, ThemeParams> = {
  dark: {
    bg_color: '#182533',
    text_color: '#ffffff',
    hint_color: '#7d8b99',
    link_color: '#6ab2f2',
    button_color: '#2aabee',
    button_text_color: '#ffffff',
    secondary_bg_color: '#232e3c',
  },
  light: {
    bg_color: '#ffffff',
    text_color: '#000000',
    hint_color: '#999999',
    link_color: '#2481cc',
    button_color: '#2481cc',
    button_text_color: '#ffffff',
    secondary_bg_color: '#f1f1f1',
  },
};

/** Maps SDK themeParams onto `--tg-theme-*` custom properties (docs/sdk-v1.md §2.3). */
export function applyThemeVars(root: HTMLElement, scheme: ColorScheme): void {
  const theme = THEME_PARAMS[scheme];
  const vars: Record<string, string> = {
    '--tg-theme-bg-color': theme.bg_color,
    '--tg-theme-text-color': theme.text_color,
    '--tg-theme-hint-color': theme.hint_color,
    '--tg-theme-link-color': theme.link_color,
    '--tg-theme-button-color': theme.button_color,
    '--tg-theme-button-text-color': theme.button_text_color,
    '--tg-theme-secondary-bg-color': theme.secondary_bg_color,
    '--tg-color-scheme': scheme,
  };
  for (const [name, value] of Object.entries(vars)) {
    root.style.setProperty(name, value);
  }
}
