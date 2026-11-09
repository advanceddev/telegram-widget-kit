export type ThemeParams = {
  bg_color: string;
  text_color: string;
  hint_color: string;
  link_color: string;
  button_color: string;
  button_text_color: string;
  secondary_bg_color: string;
};

const THEMES: Record<'dark' | 'light', ThemeParams> = {
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

export function applyThemeVars(root: HTMLElement, scheme: 'dark' | 'light') {
  const t = THEMES[scheme];
  root.style.setProperty('--tg-theme-bg-color', t.bg_color);
  root.style.setProperty('--tg-theme-text-color', t.text_color);
  root.style.setProperty('--tg-theme-hint-color', t.hint_color);
  root.style.setProperty('--tg-theme-link-color', t.link_color);
  root.style.setProperty('--tg-theme-button-color', t.button_color);
  root.style.setProperty('--tg-theme-button-text-color', t.button_text_color);
  root.style.setProperty('--tg-theme-secondary-bg-color', t.secondary_bg_color);
  root.style.setProperty('--tg-color-scheme', scheme);
}

export function telegramMockScript(scheme: 'dark' | 'light'): string {
  const theme = THEMES[scheme];
  return `<script>
(function(){
  var themeParams=${JSON.stringify(theme)};
  var listeners={};
  window.TelegramWidget={
    profile:1,
    isProfileAtLeast:function(n){return 1>=n},
    colorScheme:${JSON.stringify(scheme)},
    themeParams:themeParams,
    isActive:true,
    isPreview:false,
    isForward:false,
    chatType:'private',
    contentSafeAreaInset:{top:0,right:0,bottom:22,left:0,cornerLeft:0,cornerRight:56},
    chatData:null,
    publicData:null,
    onEvent:function(t,f){(listeners[t]=listeners[t]||[]).push(f)},
    offEvent:function(t,f){var l=listeners[t]||[],i=l.indexOf(f);if(i>=0)l.splice(i,1)},
    openLink:function(u){console.log('[openLink]',u);alert('openLink: '+u)},
    openTelegramLink:function(u){console.log('[openTelegramLink]',u);alert('openTelegramLink: '+u)},
    HapticFeedback:{
      impactOccurred:function(s){console.log('[haptic impact]',s)},
      notificationOccurred:function(t){console.log('[haptic notification]',t)},
      selectionChanged:function(){console.log('[haptic selection]')}
    },
    request:function(d){console.log('[request]',d);return Promise.resolve({result:'{}'})},
    copyText:function(t){console.log('[copyText]',t);try{navigator.clipboard.writeText(t)}catch(e){}},
    wallet:{
      signData:function(payload,data){console.log('[wallet.signData]',payload,data);return Promise.resolve({result:JSON.stringify({s:{ok:true,w:'demo'}})})},
      sendTransaction:function(tx,data){console.log('[wallet.sendTransaction]',tx,data);return Promise.resolve({result:JSON.stringify({t:{st:'ok',w:'demo'}})})}
    },
    setResizeAnchor:function(e){console.log('[setResizeAnchor]',e)}
  };
  var r=document.documentElement;
  r.style.setProperty('--tg-theme-bg-color',themeParams.bg_color);
  r.style.setProperty('--tg-theme-text-color',themeParams.text_color);
  r.style.setProperty('--tg-theme-hint-color',themeParams.hint_color);
  r.style.setProperty('--tg-theme-link-color',themeParams.link_color);
  r.style.setProperty('--tg-theme-button-color',themeParams.button_color);
  r.style.setProperty('--tg-theme-button-text-color',themeParams.button_text_color);
  r.style.setProperty('--tg-theme-secondary-bg-color',themeParams.secondary_bg_color);
  r.style.setProperty('--tg-color-scheme',${JSON.stringify(scheme)});
  r.style.setProperty('--tg-content-safe-area-inset-bottom','22px');
  r.style.setProperty('--tg-content-safe-area-corner-right','56px');
  r.style.setProperty('--tg-text-font-size','15px');
  r.style.setProperty('--tg-text-line-height','1.35');
  r.style.setProperty('--tg-text-padding','8px 12px');

  /* Auto-height reporter for parent playground */
  function reportHeight() {
    try {
      var body = document.body;
      var html = document.documentElement;
      body.style.height = 'auto';
      html.style.height = 'auto';
      var bottom = 0;
      var kids = body.children;
      for (var i = 0; i < kids.length; i++) {
        var el = kids[i];
        var top = el.offsetTop || 0;
        var h = el.offsetHeight || 0;
        if (top + h > bottom) bottom = top + h;
      }
      var cs = window.getComputedStyle(body);
      var pad = (parseFloat(cs.paddingTop) || 0) + (parseFloat(cs.paddingBottom) || 0);
      var h = Math.max(
        bottom + pad,
        body.scrollHeight || 0,
        body.offsetHeight || 0
      );
      parent.postMessage({ type: 'tw-widget-height', height: h }, '*');
    } catch (e) {}
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      reportHeight();
      setTimeout(reportHeight, 50);
      setTimeout(reportHeight, 200);
    });
  } else {
    reportHeight();
    setTimeout(reportHeight, 50);
    setTimeout(reportHeight, 200);
  }
  window.addEventListener('load', reportHeight);
  if (typeof ResizeObserver !== 'undefined') {
    var ro = new ResizeObserver(function () { reportHeight(); });
    if (document.body) ro.observe(document.body);
    else document.addEventListener('DOMContentLoaded', function () { ro.observe(document.body); });
  }
})();
</script>`;
}

const PREVIEW_BASE_CSS = `<style>
html,body{margin:0;padding:0;height:auto!important;min-height:0!important;max-height:none!important;overflow:hidden!important}
body{background:var(--tg-theme-bg-color);color:var(--tg-theme-text-color)}
</style>`;

export function wrapForPreview(html: string, scheme: 'dark' | 'light'): string {
  const mock = telegramMockScript(scheme);
  const headBits = mock + PREVIEW_BASE_CSS;
  if (/<html[\s>]/i.test(html)) {
    if (/<head[\s>]/i.test(html)) {
      return html.replace(/<head([^>]*)>/i, `<head$1>${headBits}`);
    }
    return html.replace(/<html([^>]*)>/i, `<html$1><head>${headBits}</head>`);
  }
  return `<!DOCTYPE html><html><head><meta charset="utf-8">${headBits}</head><body>${html}</body></html>`;
}
