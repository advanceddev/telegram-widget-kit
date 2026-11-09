import { EditorView, basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { html as htmlLang } from '@codemirror/lang-html';
import { css as cssLang } from '@codemirror/lang-css';
import { javascript as jsLang } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { keymap } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';

import { wrapForPreview, applyThemeVars } from './mock-telegram';
import { assembleWidget, minifyWidget, zlibSize, rawSize } from './assemble';
import { lintWidgetParts } from './profile-lint';
import { TEMPLATES } from './templates-data';
import { parseTgwOrHtml, buildTgwPackage } from './split-html';

const RAW_LIMIT = 32768;
const ZLIB_LIMIT = 4096;

let scheme: 'dark' | 'light' = 'dark';
let lastBuilt = '';
let builtMinified = '';

function makeEditor(parent: HTMLElement, lang: 'html' | 'css' | 'js', doc: string): EditorView {
  const extensions: any[] = [
    basicSetup,
    oneDark,
    history(),
    keymap.of([...defaultKeymap, ...historyKeymap]),
    EditorView.updateListener.of((u) => {
      if (u.docChanged) onEditorsChanged();
    }),
  ];
  if (lang === 'html') extensions.push(htmlLang());
  if (lang === 'css') extensions.push(cssLang());
  if (lang === 'js') extensions.push(jsLang());

  return new EditorView({
    state: EditorState.create({ doc, extensions }),
    parent,
  });
}

const edHtml = makeEditor(document.getElementById('panel-html')!, 'html', TEMPLATES.example.html);
const edCss = makeEditor(document.getElementById('panel-css')!, 'css', TEMPLATES.example.css);
const edJs = makeEditor(document.getElementById('panel-js')!, 'js', TEMPLATES.example.js);

function getParts() {
  return {
    html: edHtml.state.doc.toString(),
    css: edCss.state.doc.toString(),
    js: edJs.state.doc.toString(),
  };
}

function setParts(t: { html: string; css: string; js: string }) {
  edHtml.dispatch({ changes: { from: 0, to: edHtml.state.doc.length, insert: t.html } });
  edCss.dispatch({ changes: { from: 0, to: edCss.state.doc.length, insert: t.css } });
  edJs.dispatch({ changes: { from: 0, to: edJs.state.doc.length, insert: t.js } });
}

document.querySelectorAll('.tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    const name = (tab as HTMLElement).dataset.tab!;
    document.querySelectorAll('.tab').forEach((t) => t.classList.remove('active'));
    document.querySelectorAll('.editor-panel').forEach((p) => p.classList.remove('active'));
    tab.classList.add('active');
    document.querySelector(`[data-panel="${name}"]`)?.classList.add('active');
    if (name === 'html') edHtml.requestMeasure();
    if (name === 'css') edCss.requestMeasure();
    if (name === 'js') edJs.requestMeasure();
  });
});

let debounce = 0;
function onEditorsChanged() {
  clearTimeout(debounce);
  debounce = window.setTimeout(() => {
    const { html, css, js } = getParts();
    const issues = lintWidgetParts(html, css, js);
    renderLint(issues);
    const assembled = assembleWidget(html, css, js);
    updateSizes(assembled, false);
  }, 200);
}

function renderLint(issues: ReturnType<typeof lintWidgetParts>) {
  const panel = document.getElementById('lint-panel')!;
  const list = document.getElementById('lint-list')!;
  if (!issues.length) {
    panel.hidden = true;
    list.innerHTML = '';
    return;
  }
  panel.hidden = false;
  list.innerHTML = issues.map((i) => `<li>${escapeHtml(i.message)}</li>`).join('');
}

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function updateSizes(text: string, isBuilt: boolean) {
  const raw = rawSize(text);
  const z = await zlibSize(text);
  document.getElementById('size-raw')!.textContent = formatBytes(raw);
  document.getElementById('size-zlib')!.textContent = formatBytes(z);

  const status = document.getElementById('size-status')!;
  if (raw > RAW_LIMIT || z > ZLIB_LIMIT) {
    status.textContent = `ПРЕВЫШЕН лимит (32 KB / 4 KB)`;
    status.className = 'limit bad';
  } else if (z > 3800) {
    status.textContent = `Близко к лимиту — оставь запас`;
    status.className = 'limit warn';
  } else {
    status.textContent = isBuilt ? `OK · готово к отправке` : `OK (лимит 32 KB / 4 KB)`;
    status.className = 'limit ok';
  }

  if (isBuilt) {
    document.getElementById('build-meta')!.textContent =
      `${formatBytes(raw)} · zlib ${formatBytes(z)}`;
  }
}

function formatBytes(n: number) {
  if (n < 1024) return n + ' B';
  return (n / 1024).toFixed(2) + ' KB';
}

const HEIGHT_MIN = 50;
const HEIGHT_MAX = 600;

function applyHeight(raw: number) {
  const preview = document.getElementById('preview') as HTMLIFrameElement;
  const bubble = document.getElementById('bubble') as HTMLDivElement;
  const h = Math.min(Math.max(Math.ceil(raw), HEIGHT_MIN), HEIGHT_MAX);
  bubble.style.height = h + 'px';
  bubble.style.maxHeight = HEIGHT_MAX + 'px';
  bubble.style.overflow = 'hidden';
  preview.style.height = h + 'px';
}

window.addEventListener('message', (ev) => {
  const data = ev.data;
  if (!data || data.type !== 'tw-widget-height') return;
  if (typeof data.height !== 'number' || !Number.isFinite(data.height)) return;
  applyHeight(data.height);
});

async function doBuild() {
  const { html, css, js } = getParts();
  const issues = lintWidgetParts(html, css, js);
  renderLint(issues);

  const assembled = assembleWidget(html, css, js);
  const minified = minifyWidget(assembled);
  lastBuilt = assembled;
  builtMinified = minified;

  document.getElementById('built-output')!.textContent = minified;
  await updateSizes(minified, true);

  const preview = document.getElementById('preview') as HTMLIFrameElement;
  const bubble = document.getElementById('bubble') as HTMLDivElement;

  bubble.style.height = HEIGHT_MIN + 'px';
  preview.style.height = HEIGHT_MIN + 'px';
  preview.srcdoc = wrapForPreview(assembled, scheme);
}

document.getElementById('btn-build')!.addEventListener('click', () => {
  doBuild();
});

document.getElementById('btn-copy')!.addEventListener('click', async () => {
  if (!builtMinified) await doBuild();
  await navigator.clipboard.writeText(builtMinified || lastBuilt);
  const btn = document.getElementById('btn-copy')!;
  const prev = btn.textContent;
  btn.textContent = 'Скопировано ✓';
  setTimeout(() => (btn.textContent = prev), 1200);
});

document.getElementById('btn-download')!.addEventListener('click', async () => {
  if (!builtMinified) await doBuild();
  const blob = new Blob([builtMinified || lastBuilt], { type: 'text/html;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'widget.html';
  a.click();
  URL.revokeObjectURL(a.href);
});

function readTgwForm() {
  const allow = (document.getElementById('tgw-allow-queries') as HTMLInputElement).checked;
  const fwd = (document.getElementById('tgw-fwd-queries') as HTMLInputElement).checked;
  const shared = (document.getElementById('tgw-shared') as HTMLInputElement).checked;
  const width = Number((document.getElementById('tgw-width') as HTMLInputElement).value) || 0;
  const height = Number((document.getElementById('tgw-height') as HTMLInputElement).value) || 0;
  const pub = (document.getElementById('tgw-public-data') as HTMLTextAreaElement).value.trim();
  const chat = (document.getElementById('tgw-chat-data') as HTMLTextAreaElement).value.trim();
  return {
    width,
    height,
    allow_queries: allow || fwd,
    fwd_allow_queries: fwd,
    shared_widget: shared || fwd,
    public_data: pub || null,
    chat_data: chat || null,
  };
}

function writeTgwForm(tgw: {
  width?: number;
  height?: number;
  allow_queries?: boolean;
  fwd_allow_queries?: boolean;
  shared_widget?: boolean;
  public_data?: string | null;
  chat_data?: string | null;
}) {
  if (tgw.width != null)
    (document.getElementById('tgw-width') as HTMLInputElement).value = String(tgw.width);
  if (tgw.height != null)
    (document.getElementById('tgw-height') as HTMLInputElement).value = String(tgw.height);
  if (tgw.allow_queries != null)
    (document.getElementById('tgw-allow-queries') as HTMLInputElement).checked =
      !!tgw.allow_queries;
  if (tgw.fwd_allow_queries != null)
    (document.getElementById('tgw-fwd-queries') as HTMLInputElement).checked =
      !!tgw.fwd_allow_queries;
  if (tgw.shared_widget != null)
    (document.getElementById('tgw-shared') as HTMLInputElement).checked = !!tgw.shared_widget;
  if (tgw.public_data != null)
    (document.getElementById('tgw-public-data') as HTMLTextAreaElement).value = tgw.public_data;
  if (tgw.chat_data != null)
    (document.getElementById('tgw-chat-data') as HTMLTextAreaElement).value = tgw.chat_data;
}

document.getElementById('btn-export-tgw')!.addEventListener('click', async () => {
  if (!builtMinified) await doBuild();
  const html = builtMinified || lastBuilt;
  const form = readTgwForm();
  if (form.public_data && form.public_data.length > 1024) {
    alert('public_data > 1024 bytes');
    return;
  }
  if (form.chat_data && form.chat_data.length > 1024) {
    alert('chat_data > 1024 bytes');
    return;
  }
  const pkg = buildTgwPackage(html, {
    ...form,
    meta: { name: 'widget', note: 'TG Widget Kit · maps to inputMediaWidget (docs/tgw-format.md)' },
  });
  const blob = new Blob([JSON.stringify(pkg, null, 2)], { type: 'application/json;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'widget.tgw';
  a.click();
  URL.revokeObjectURL(a.href);
});

document.getElementById('btn-open')!.addEventListener('click', () => {
  document.getElementById('file-open')!.click();
});

document.getElementById('file-open')!.addEventListener('change', async (e) => {
  const input = e.target as HTMLInputElement;
  const file = input.files && input.files[0];
  if (!file) return;
  try {
    const text = await file.text();
    const { parts, tgw } = parseTgwOrHtml(text, file.name);
    setParts(parts);
    if (tgw) writeTgwForm(tgw);
    await doBuild();
  } catch (err: any) {
    alert('Не удалось открыть: ' + (err && err.message ? err.message : String(err)));
  }
  input.value = '';
});

document.getElementById('template-select')!.addEventListener('change', (e) => {
  const key = (e.target as HTMLSelectElement).value;
  const t = TEMPLATES[key];
  if (t) {
    setParts(t);
    doBuild();
  }
});

const widthRange = document.getElementById('width-range') as HTMLInputElement;
const widthLabel = document.getElementById('width-label') as HTMLElement;
const bubble = document.getElementById('bubble') as HTMLDivElement;
widthRange.addEventListener('input', () => {
  widthLabel.textContent = widthRange.value + ' px';
  bubble.style.width = widthRange.value + 'px';
});

document.getElementById('theme-toggle')!.addEventListener('click', () => {
  scheme = scheme === 'dark' ? 'light' : 'dark';
  document.getElementById('chat-mock')!.dataset.theme = scheme;
  applyThemeVars(document.documentElement, scheme);
  doBuild();
});

window.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
    e.preventDefault();
    doBuild();
  }
});

applyThemeVars(document.documentElement, scheme);
doBuild();
