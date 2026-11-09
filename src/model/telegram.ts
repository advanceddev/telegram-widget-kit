/**
 * TypeScript contract of the widget-facing SDK v1 (`window.TelegramWidget`).
 * Mirrors widget-sandbox docs/sdk-v1.md §2.1–§2.18. Widgets run inside a
 * sandboxed renderer; this surface is what their scripts may call.
 */

export type ThemeParams = {
  bg_color: string;
  text_color: string;
  hint_color: string;
  link_color: string;
  button_color: string;
  button_text_color: string;
  secondary_bg_color: string;
};

export type ColorScheme = 'light' | 'dark';

export type HapticStyle = 'light' | 'medium' | 'heavy' | 'rigid' | 'soft';
export type HapticNotification = 'error' | 'success' | 'warning';

export type TelegramEvent =
  | 'themeChanged'
  | 'activated'
  | 'deactivated'
  | 'chatDataChanged'
  | 'publicDataChanged'
  | 'contentSafeAreaChanged';

export interface ContentSafeAreaInset {
  top: number;
  right: number;
  bottom: number;
  left: number;
  cornerLeft: number;
  cornerRight: number;
}

export interface TelegramViewer {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  is_premium?: boolean;
}

export interface HapticFeedback {
  impactOccurred(style: HapticStyle): HapticFeedback;
  notificationOccurred(type: HapticNotification): HapticFeedback;
  selectionChanged(): HapticFeedback;
}

export interface TelegramWallet {
  signTransaction: never;
  signData(payload: string, data?: string): Promise<{ result: string }>;
  sendTransaction(transaction: string, data?: string): Promise<{ result: string }>;
}

export interface TelegramWidget {
  readonly profile: number;
  isProfileAtLeast(n: number): boolean;
  readonly colorScheme: ColorScheme;
  readonly themeParams: ThemeParams;
  readonly isActive: boolean;
  readonly contentSafeAreaInset: ContentSafeAreaInset | undefined;
  onEvent(type: TelegramEvent, handler: () => void): void;
  offEvent(type: TelegramEvent, handler: () => void): void;
  openLink(url: string): void;
  openTelegramLink(url: string): void;
  readonly HapticFeedback: HapticFeedback;
  ready(): void;
  setResizeAnchor(edge: 'top' | 'bottom'): void;
  watchPublicData(): void;
  unwatchPublicData(): void;
  readonly chatData: string | null;
  readonly publicData: string | null;
  readonly isForward: boolean;
  readonly chatType: 'private' | 'group' | 'supergroup' | 'channel' | null;
  readonly viewer: TelegramViewer | null;
  readonly isPreview: boolean;
  request(data: string, options?: { wallet?: boolean }): Promise<{ result: string | null }>;
  readonly wallet: TelegramWallet | null;
  copyText(text: string): void;
}
