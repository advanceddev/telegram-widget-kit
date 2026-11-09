/**
 * Russian messages — the schema of truth (`MessageSchema`).
 * `{'@'}` escapes the linked-message character in vue-i18n.
 */
export const ru = {
  common: {
    px: 'px',
    measuring: '…',
  },

  locale: {
    label: 'Язык интерфейса',
  },

  sidebar: {
    sectionSource: 'Виджет',
    sectionChecks: 'Проверки',
    templateLabel: 'Шаблон',
    widthLabel: 'Ширина пузыря',
    themeToggle: 'Тема чата',
    themeDark: 'Тёмная',
    themeLight: 'Светлая',
    hintLine1: 'Раздельно: HTML · CSS · JS.',
    hintLine2:
      'Изменения применяются к превью автоматически; экспорт всегда использует последнюю сборку.',
    hintRebuild: 'пересобрать немедленно.',
  },

  export: {
    summary: 'Настройки экспорта',
    note:
      'Параметры inputMediaWidget для бота (не внутри HTML). HTML фиксируется при отправке; ' +
      'public_data и chat_data бот может менять позже.',
    allowQueries: 'allow_queries',
    fwdAllowQueries: 'fwd_allow_queries',
    sharedWidget: 'shared_widget',
    dimensions: 'width / height (0 = auto)',
    publicData: 'public_data (JSON, ≤1024 B)',
    chatData: 'chat_data (JSON, ≤1024 B)',
  },

  stats: {
    html: 'HTML',
    zlib: 'zlib-9',
  },

  size: {
    status: {
      ok: 'OK (лимит 32 KB / 4 KB)',
      okBuilt: 'OK · готово к отправке',
      warn: 'Близко к лимиту — оставь запас',
      bad: 'ПРЕВЫШЕН лимит (32 KB / 4 KB)',
    },
  },

  lint: {
    title: '⚠ Нарушения профиля',
    tagForbidden: '<{tag}> запрещён в profile 1 (будет удалён клиентом)',
    srcExternal: 'src= только data: (PNG/JPEG/GIF/WebP) — внешние URL запрещены',
    scriptSrc: '<script src> запрещён — только inline JS',
    linkTag: '<link> запрещён — CSS только inline',
    attrForbidden: 'атрибут {attr}= вне профиля',
    cssFontFace: "{'@'}font-face запрещён — только system-ui / sans-serif / serif / monospace",
    cssImport: "{'@'}import запрещён",
    cssUrl: 'url() в CSS только data: или #fragment',
    cssOverflow: 'overflow: auto/scroll запрещён — скролла внутри виджета нет',
    cssSticky: 'position: sticky вне профиля',
    cssViewportUnits: 'единицы vh/dvh/svh вне профиля — используй % / flex',
    css3dTransforms: '3D transforms вне профиля',
    jsNetwork: '{api} недоступен (NetworkDisabledError)',
    jsEval: '{api} запрещён / не нужен',
    jsDocumentWrite: 'document.write вне профиля',
  },

  editor: {
    tabHtml: 'HTML',
    tabCss: 'CSS',
    tabJs: 'JS',
    tabBuilt: 'Результат',
    builtEmpty: 'Здесь появится минифицированный результат сборки.',
    loading: 'Загрузка редактора…',
  },

  format: {
    button: 'Форматировать',
    title: 'Форматировать документ ({hotkey})',
    hotkeyMac: '⇧ ⌥ F',
    hotkeyOther: 'Shift+Alt+F',
    error: 'Не удалось отформатировать {part} — проверь синтаксис',
  },

  preview: {
    title: 'Preview',
    frameTitle: 'Предпросмотр виджета',
  },

  actions: {
    copy: 'Копировать HTML',
    copied: 'Скопировано ✓',
    downloadHtml: 'Скачать .html',
    downloadTgw: 'Скачать .tgw',
    open: 'Открыть файл…',
  },

  templates: {
    custom: 'свой вариант',
    example: 'пример',
    card: 'карточка',
    counter: 'счётчик',
    status: 'статус',
    converter: 'конвертер',
    wallet: 'кошелёк',
    cube3d: 'куб 3D',
    poll: 'опрос · corpus',
    ticker: 'тикер · corpus',
    promo: 'промо · corpus',
    order: 'заказ · corpus',
  },

  toast: {
    fileOpened: 'Файл загружен: {name}',
    openError: 'Не удалось открыть: {message}',
    publicDataTooBig: 'public_data больше {limit} байт ({size})',
    chatDataTooBig: 'chat_data больше {limit} байт ({size})',
  },

  layout: {
    splitLabel: 'Изменить соотношение панелей редактора и превью',
  },
};
