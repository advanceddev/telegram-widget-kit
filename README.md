# TG Widget Kit — Vue 3 Edition

Локальный playground и сборщик **Telegram HTML-виджетов** (profile 1), полностью
переписанный с vanilla-TS на **Vue 3 (Composition API, `<script setup>`)**.

> Документация Telegram: https://github.com/TelegramMessenger/widget-sandbox/tree/main/docs
> (контракты `docs/sdk-v1.md`, `docs/tgw-format.md`, `docs/profile-v1.md`).

## Возможности

- **Раздельные вкладки HTML / CSS / JS** с подсветкой (CodeMirror 6, ленивая загрузка)
- **Автосборка без кнопок** — превью всегда следует за исходниками (debounce),
  один HTML, минификация, zlib-9, живой предпросмотр в пузыре чата
- **Форматирование (Prettier standalone, ленивый чанк)** — Shift+Option+F на macOS /
  Shift+Alt+F на Windows/Linux (работает в любой раскладке); если документ
  не отформатирован — в правом нижнем углу редактора появляется оверлей-кнопка
  с подсказкой о хоткее; импортированные `.html` / `.tgw` разворачиваются в читаемый вид одним нажатием
- **Линтер profile 1** — структурные коды нарушений + локализованные сообщения (ru/en)
- **i18n ru + en** — переключатель в шапке сайдбара, выбор сохраняется
- **Resizable split** — перетаскиваемый разделитель редактор/превью (мышь + клавиатура, a11y)
- **localStorage** — исходники, шаблон, тема, ширина, язык, экспортные поля и split
  восстанавливаются после перезагрузки
- Экспорт: копирование HTML, скачивание `.html` и `.tgw` (`tg-widget/v1`), открытие файлов
- Копирование/скачивание автоматически пересобирают устаревший билд

## Запуск

```bash
pnpm install
pnpm dev        # http://localhost:5173
```

## Скрипты

| Команда             | Что делает                                              |
| ------------------- | ------------------------------------------------------- |
| `pnpm dev`          | dev-сервер Vite                                         |
| `pnpm build`        | typecheck (`vue-tsc`) + production build                |
| `pnpm typecheck`    | `vue-tsc` (src) + `tsc` (конфиги/e2e)                   |
| `pnpm test`         | Vitest: unit + компонентные тесты                       |
| `pnpm test:watch`   | Vitest в watch-режиме                                   |
| `pnpm test:e2e`     | Playwright (нужен `pnpm exec playwright install chromium`) |
| `pnpm lint` / `pnpm fmt` | oxlint / oxfmt                                     |
| `pnpm check`        | typecheck + lint + tests                                |

## Лимиты Telegram

|              |                                                            |
| ------------ | ---------------------------------------------------------- |
| Raw HTML     | ≤ 32 KB                                                    |
| zlib level 9 | ≤ 4 KB                                                     |
| Картинки     | только `data:` PNG/JPEG/GIF/WebP                           |
| Запрещено    | form/input, сеть, внешние шрифты, 3D, sticky, inner scroll |

## Архитектура

Однослойные зависимости, только вниз: `components → composables → services → core`.

```
src/
├── config/limits.ts        # лимиты Telegram + тюнинг playground (debounce и т.п.)
├── model/                  # типы домена: Parts, LintIssue, TgwPackage, SDK v1 (TelegramWidget)
├── core/                   # ЧИСТАЯ домен-логика, ноль зависимостей от Vue
│   ├── assemble/           #   assembleWidget, minifyWidget, размеры + race-guard
│   ├── lint/               #   profile 1: запрещённые теги/атрибуты/CSS/JS → коды
│   ├── mock/               #   SDK v1 mock, темы, обёртка preview-документа
│   ├── tgw/                #   split-html, сборка/разбор tg-widget/v1
│   ├── templates/          #   11 шаблонов (портированы 1:1)
│   └── utils/              #   formatBytes
├── services/               # оркестрация без UI
│   ├── build-service.ts    #   lint → assemble → minify → size → preview (race-guard)
│   ├── format-service.ts   #   Prettier standalone (ленивые чанки), html/css/babel
│   ├── export-service.ts   #   clipboard (с fallback), download, сборка .tgw
│   └── persistence-service.ts # версионируемые prefs + DI storage (тестируемо)
├── i18n/                   # vue-i18n (legacy:false), схема сообщений из ru-локали
├── composables/            # состояние и DOM-интеграции
│   ├── use-widget-sources.ts     # html/css/js, шаблон, dirty
│   ├── use-build.ts              # lint issues, размеры, билд-артефакты
│   ├── use-preview.ts            # scheme, width, height, previewDoc
│   ├── use-tgw-export.ts         # форма экспорта + валидация 1024 B
│   ├── use-settings.ts           # splitRatio (автосборка — всегда включена)
│   ├── use-notifications.ts      # тосты вместо alert()
│   ├── use-locale.ts             # переключение ru/en
│   ├── use-persistence-binding.ts# restore() + один debounced writer
│   ├── use-code-editor.ts        # CodeMirror 6: ленивый import, echo-suppression
│   ├── use-formatter.ts          # детект «не отформатирован» + formatPart (race-guard)
│   ├── use-split-drag.ts         # pointer + keyboard resize
│   └── ... (debounce, hotkey, event-listener, widget-height, file-picker)
└── components/             # App, layout/, sidebar/, editor/, preview/, feedback/
```

### Поток данных

```
набор кода → sources (composable)
          → debounce 220 мс → lint + размеры (race-guard)
          → debounce 650 мс → build()  (автосборка — всегда)
build():  assemble → minify → размеры → previewDoc (iframe) → markClean()
Ctrl/Cmd+Enter — мгновенный build; копирование/экспорт пересобирают при dirty
```

### Ключевые решения

- **Состояние без Pinia** — фабрики `createX()` + модульные синглтоны. Приложение
  клиент-онли и одноэкранное; композиции тестируемы (фабрики вызываются в тестах заново).
- **`core` не знает про Vue** — линтер возвращает коды (`tagForbidden`), тексты
  живут в локалях; ядро можно вынести в отдельный пакет без изменений.
- **CodeMirror**: динамический `import()` (отдельный vendor-чанк), `shallowRef` на
  `EditorView` (инстансы CM нельзя заворачивать в deep-proxy), панели на `v-show`,
  echo-suppression при программной замене документа, `requestMeasure()` при активации.
- **Race-guard**: измерение zlib асинхронно; monotonic epoch отбрасывает устаревшие
  результаты (фикс гонки оригинала).
- **Валидация `public_data`/`chat_data`** — байтово по UTF-8 (1024 B по спецификации),
  у оригинала была проверка по длине строки UTF-16.
- **Исправления линтера**: ловит `overflow-x/y` и `100vh` (оригинальные паттерны
  `\boverflow\b\s*:` и `\bvh\b` их пропускали).
- **A11y**: role=tablist/tab/tabpanel с roving focus, role=separator с
  aria-valuenow, aria-live на статусе размеров и тостах, `prefers-reduced-motion`.
- **Перф**: debounce 220/650/400 мс, один passive-слушатель `message`, teleport
  тостов, css-токены вместо инлайн-стилей, code-splitting CodeMirror и Prettier
  (форматтер грузится при первом использовании, стартовый бандл его не тянет).

## Тесты

```
tests/unit/          # ядро: assemble, minify, sizes+race-guard, split-html, tgw,
                     # lint, mock/themes, шаблоны, persistence, state-композаблы,
                     # format-service, use-formatter
tests/components/    # EditorPane (ARIA/табы), CodeEditor (мок CM6: v-model + echo),
                     # format-overlay (минифицированный импорт → пилл → клик/хоткей),
                     # LintPanel, SizeStatsPanel, ThemeField, ToastStack
e2e/playground.spec.ts  # Playwright: автосборка, шаблоны, тема, язык, линт-панель,
                        # resizable split, стабильность высоты пузыря
```

```bash
pnpm test                        # unit + компонентные
pnpm exec playwright install chromium   # один раз
pnpm test:e2e                    # e2e против dev-сервера
```

## Структура проекта

```
index.html            # точка входа Vite
vite.config.ts        # alias @, oxc-minify, es2022
vitest.config.ts      # happy-dom, unit + компонентные
playwright.config.ts  # chromium, webServer: vite dev
tsconfig.{app,node,vitest}.json
```
