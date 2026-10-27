/* IRPWM offline cache. Core files are cached on install; the page PDF is cached the first time it is used. */
const CACHE = 'irpwm-2.0.0-10587c3d1a';
const CORE = ["./", "assets/app.css", "assets/app.js", "assets/fonts/source-sans-3-latin-400-italic.woff2", "assets/fonts/source-sans-3-latin-400-normal.woff2", "assets/fonts/source-sans-3-latin-500-normal.woff2", "assets/fonts/source-sans-3-latin-600-italic.woff2", "assets/fonts/source-sans-3-latin-600-normal.woff2", "assets/fonts/source-sans-3-latin-700-normal.woff2", "assets/fonts/source-serif-4-latin-400-italic.woff2", "assets/fonts/source-serif-4-latin-400-normal.woff2", "assets/fonts/source-serif-4-latin-600-normal.woff2", "assets/fonts/source-serif-4-latin-700-normal.woff2", "companion.html", "data/abbr.json", "data/c01.json", "data/c02.json", "data/c03.json", "data/c04.json", "data/c05.json", "data/c06.json", "data/c07.json", "data/c08.json", "data/c09.json", "data/c10.json", "data/c11.json", "data/c12.json", "data/c13.json", "data/c14.json", "data/c15.json", "data/index.json", "data/pref.json", "icons/apple-touch-icon.png", "icons/favicon-64.png", "icons/icon-192.png", "icons/icon-512.png", "icons/maskable-512.png", "index.html", "install.html", "manifest.webmanifest", "vendor/pdf.min.js", "vendor/pdf.worker.min.js", "vendor/standard_fonts/FoxitDingbats.pfb", "vendor/standard_fonts/FoxitFixed.pfb", "vendor/standard_fonts/FoxitFixedBold.pfb", "vendor/standard_fonts/FoxitFixedBoldItalic.pfb", "vendor/standard_fonts/FoxitFixedItalic.pfb", "vendor/standard_fonts/FoxitSerif.pfb", "vendor/standard_fonts/FoxitSerifBold.pfb", "vendor/standard_fonts/FoxitSerifBoldItalic.pfb", "vendor/standard_fonts/FoxitSerifItalic.pfb", "vendor/standard_fonts/FoxitSymbol.pfb", "vendor/standard_fonts/LiberationSans-Bold.ttf", "vendor/standard_fonts/LiberationSans-BoldItalic.ttf", "vendor/standard_fonts/LiberationSans-Italic.ttf", "vendor/standard_fonts/LiberationSans-Regular.ttf"];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin || req.headers.get('range')) return;
  e.respondWith(
    caches.match(req, {ignoreSearch: true}).then(hit => hit || fetch(req).then(res => {
      if (res.ok && res.status === 200) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => req.mode === 'navigate' ? caches.match('index.html') : undefined))
  );
});
