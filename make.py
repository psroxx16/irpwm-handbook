#!/usr/bin/env python3
"""Assemble the IRPWM Handbook app (PWA + Capacitor Android + Electron Windows) from the handbook sources."""
import os, re, json, hashlib

SRC = '/home/claude/irpwm'
OUT = '/home/claude/irpwm-app'
VERSION = '1.0.0'

css = open(f'{SRC}/src/app.css').read()
js = open(f'{SRC}/src/app.js').read()
js = js.replace('main.addEventListener("click",function(e){var a=e.target.closest(\'a[href^="#"]\');if(a&&a.getAttribute("href")===location.hash){route();}});',
 'main.addEventListener("click",function(e){var a=e.target.closest(\'a[href^="#"]\');if(!a)return;if(q.value){q.value="";}if(a.getAttribute("href")===location.hash){route();}});')
order = ['c01','c02','c03','c04','c05','c06','c07','c08','c09','c10','c11','c12_15','glossary']
content = 'window.CH=[];\n' + '\n'.join(open(f'{SRC}/content/{n}.js').read() for n in order)
head = open(f'{SRC}/src/head.html').read()

# --- head: drop artifact-only meta and Google Fonts; add PWA/native meta -------------
head = head.replace('<meta name="claude:viewport-fit-sides" content="cover">\n', '')
head = re.sub(r'<link rel="preconnect"[^\n]*\n', '', head)
head = re.sub(r'<link rel="stylesheet" href="https://fonts.googleapis.com[^\n]*\n', '', head)

fonts = [('Barlow Condensed', 'barlow-condensed', [500, 600, 700]),
         ('IBM Plex Mono', 'ibm-plex-mono', [400, 500]),
         ('IBM Plex Sans', 'ibm-plex-sans', [400, 500, 600])]
fontcss = ''.join(
    f'@font-face{{font-family:"{fam}";font-style:normal;font-weight:{w};font-display:swap;'
    f'src:url(fonts/{slug}-latin-{w}-normal.woff2) format("woff2")}}\n'
    for fam, slug, ws in fonts for w in ws)

app_css = '''
/* app shell additions */
.getapp{position:fixed;right:max(16px,env(safe-area-inset-right,0px));bottom:max(16px,env(safe-area-inset-bottom,0px));z-index:70;
  display:none;align-items:center;gap:8px;background:var(--signal);color:var(--signal-ink);border:0;border-radius:999px;
  font:600 14px/1 var(--f-body);padding:12px 16px 12px 14px;box-shadow:0 6px 24px rgba(0,0,0,.25);cursor:pointer}
.getapp.show{display:inline-flex}
.getapp .x{margin-left:4px;opacity:.65;font-size:16px;line-height:1;padding:0 2px}
html.standalone .getapp{display:none!important}
'''

pre = f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#17212B">
<meta name="color-scheme" content="light dark">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="IRPWM">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" type="image/png" href="icons/favicon-64.png">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
<link rel="preload" href="fonts/ibm-plex-sans-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="fonts/barlow-condensed-latin-700-normal.woff2" as="font" type="font/woff2" crossorigin>
'''

shell_js = r'''
(function(){
  var isNative = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()) || /Electron/i.test(navigator.userAgent);
  var standalone = isNative || (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
  if (standalone) document.documentElement.classList.add('standalone');
  if (isNative) document.documentElement.classList.add('native');

  // Offline cache (only when served over http/https, not inside the native shells)
  if (!isNative && 'serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener('load', function(){ navigator.serviceWorker.register('sw.js').catch(function(){}); });
  }

  // "Get the app" chip
  var btn = document.getElementById('getapp'), deferred = null, dismissed = false;
  try { dismissed = localStorage.getItem('irpwm-getapp-dismissed') === '1'; } catch(e) {}
  if (standalone || dismissed || !btn) return;
  btn.classList.add('show');
  window.addEventListener('beforeinstallprompt', function(e){ e.preventDefault(); deferred = e; });
  window.addEventListener('appinstalled', function(){ btn.classList.remove('show'); });
  btn.addEventListener('click', function(e){
    if (e.target.classList.contains('x')) {
      btn.classList.remove('show');
      try { localStorage.setItem('irpwm-getapp-dismissed', '1'); } catch(err) {}
      return;
    }
    if (deferred) { deferred.prompt(); deferred.userChoice.finally(function(){ deferred = null; }); }
    else { location.href = 'install.html'; }
  });
})();
'''

chip = ('<button class="getapp" id="getapp" type="button" aria-label="Install the app">'
        '<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 2v8M4.5 6.5 8 10l3.5-3.5M3 13h10" stroke="currentColor" stroke-width="1.8" fill="none"/></svg>'
        'Install app<span class="x" aria-label="Dismiss" role="button">×</span></button>\n')

html = (pre + head.replace('<title>', '<title>', 1)
        .replace('<style>\n/*CSS*/\n</style>', '<style>\n' + fontcss + css + app_css + '</style>\n</head>\n<body>')
        + chip
        + '<script>\n' + content + '\n</script>\n<script>\n' + js + '\n</script>\n<script>' + shell_js + '</script>\n</body>\n</html>\n')
assert '<body>' in html and 'fonts.googleapis' not in html
os.makedirs(f'{OUT}/www', exist_ok=True)
open(f'{OUT}/www/index.html', 'w').write(html)

# --- install page ------------------------------------------------------------------
install = open(f'{OUT}/src-install.html').read()
open(f'{OUT}/www/install.html', 'w').write(install.replace('/*FONTS*/', fontcss))

# --- manifest ----------------------------------------------------------------------
manifest = {
  "name": "IRPWM Handbook", "short_name": "IRPWM",
  "description": "Plain-language handbook of the Indian Railways Permanent Way Manual (2024 reprint, corrected up to ACS-16), with calculators and quizzes. Works offline.",
  "id": "./", "start_url": "./#home", "scope": "./", "display": "standalone",
  "background_color": "#17212B", "theme_color": "#17212B", "lang": "en", "categories": ["education", "reference", "productivity"],
  "icons": [
    {"src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any"},
    {"src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any"},
    {"src": "icons/maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"}],
  "shortcuts": [
    {"name": "Calculators", "url": "./#tools", "icons": [{"src": "icons/icon-192.png", "sizes": "192x192"}]},
    {"name": "Key values", "url": "./#ref", "icons": [{"src": "icons/icon-192.png", "sizes": "192x192"}]},
    {"name": "Quiz", "url": "./#quiz", "icons": [{"src": "icons/icon-192.png", "sizes": "192x192"}]}]
}
open(f'{OUT}/www/manifest.webmanifest', 'w').write(json.dumps(manifest, indent=2))

# --- service worker (cache-first, versioned by content hash) -----------------------
files = ['./', 'index.html', 'install.html', 'manifest.webmanifest'] + \
        [f'fonts/{f}' for f in sorted(os.listdir(f'{OUT}/www/fonts'))] + \
        [f'icons/{f}' for f in sorted(os.listdir(f'{OUT}/www/icons'))]
h = hashlib.sha1()
for f in files[1:]:
    h.update(open(f'{OUT}/www/{f}', 'rb').read())
sw = f'''/* IRPWM Handbook offline cache */
const CACHE = 'irpwm-{VERSION}-{h.hexdigest()[:10]}';
const FILES = {json.dumps(files)};
self.addEventListener('install', e => {{
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
}});
self.addEventListener('activate', e => {{
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
}});
self.addEventListener('fetch', e => {{
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    caches.match(req, {{ignoreSearch: true}}).then(hit => hit || fetch(req).then(res => {{
      if (res.ok) {{ const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }}
      return res;
    }}).catch(() => req.mode === 'navigate' ? caches.match('index.html') : undefined))
  );
}});
'''
open(f'{OUT}/www/sw.js', 'w').write(sw)
print('index.html', len(html), 'bytes; cache', h.hexdigest()[:10])
