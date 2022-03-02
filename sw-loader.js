
// code to register sw.js

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/qr_code_scanner/sw.js')
    .then(() => { console.log('Service Worker Registered'); });
}