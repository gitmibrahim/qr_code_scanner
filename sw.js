self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('qrcode-scanner').then((cache) => cache.addAll([
      '/qr_code_scanner/',
      '/qr_code_scanner/index.html',
      '/qr_code_scanner/main.js',
      '/qr_code_scanner/qr-scanner.legacy.min.js',
      '/qr_code_scanner/qr-scanner.legacy.min.js.map',
      '/qr_code_scanner/style.css',
      '/qr_code_scanner/icons/qr-code-192.png',
      '/qr_code_scanner/icons/qr-code-favicon.ico',
    ])),
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request)),
  );
});
