# TG Widget Kit

Локальный playground и сборщик **Telegram HTML-виджетов** (profile 1).

## Запуск

```bash
cd tg-widget-kit
pnpm install
pnpm dev
```

## Возможности

- **Раздельные вкладки** HTML / CSS / JS с подсветкой (CodeMirror 6)
- **Build & Preview** — собирает один HTML, минифицирует, считает zlib-9, показывает в пузыре
- **Линтер profile 1** — флагирует `input`, `form`, `fetch`, `@font-face`, `overflow: auto` и т.д.
- Тема dark/light, ширина пузыря 200–430 px
- Копирование и скачивание готового файла
- `Ctrl/Cmd+Enter` — Build

## Лимиты Telegram

|              |                                                            |
| ------------ | ---------------------------------------------------------- |
| Raw HTML     | ≤ 32 KB                                                    |
| zlib level 9 | ≤ 4 KB                                                     |
| Картинки     | только `data:` PNG/JPEG/GIF/WebP                           |
| Запрещено    | form/input, сеть, внешние шрифты, 3D, sticky, inner scroll |

## Структура

```
src/
  main.ts           playground
  assemble.ts       сборка + minify
  profile-lint.ts   проверка запрещённого
  mock-telegram.ts  TelegramWidget mock
  templates-data.ts шаблоны
```

Docs: https://github.com/TelegramMessenger/widget-sandbox/tree/main/docs
