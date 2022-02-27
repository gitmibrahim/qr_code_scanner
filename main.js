

const buttonsContainerElem = document.querySelector('.buttons')
const startButtonElem = document.querySelector('button')
const videoElem = document.querySelector('video')
const imgElem = document.querySelector('img')
const resultsElem = document.querySelector('#results')
const file = document.querySelector('#file');

let latestResult = ''
let latestPrintedResult
let duplicateCount = 1
let duplicateSpan

startButtonElem.addEventListener('click', () => {
  toggleButtonAndVideoDisplay('cam')
  qrScanner.start()
})


const qrScanner = new QrScanner(videoElem, ({data}) => {
  handleTheScan(data, 'cam')
}, {
  returnDetailedScanResult: true,
  highlightScanRegion: true
});

file.addEventListener('change', () => {
  QrScanner.scanImage(file.files[0], {returnDetailedScanResult: true})
    .then(({data}) => handleTheScan(data, 'file'))
    .catch(error => console.log(error || 'No QR code found.'));
})

function handleTheScan(data, media) {
  if (data !== latestResult) {
    resultsElem.style.display = 'inline-block'

    const li = document.createElement('li')
    li.textContent = data
    resultsElem.appendChild(li)

    latestResult = data
    latestPrintedResult = li
    duplicateCount = 1
    duplicateSpan = document.createElement('span')

    resultsElem.scrollBy({
      top: resultsElem.scrollHeight,
      behavior: 'smooth'
    })
  }
  else {
    duplicateSpan.textContent = ` (${++duplicateCount})`
    if (duplicateCount == 2) {
      latestPrintedResult.appendChild(duplicateSpan)
    }
  }

  toggleButtonAndVideoDisplay(media)
}

const toggleButtonAndVideoDisplay = (media) => {
  if (media === 'cam') {
    // buttonsContainerElem.style.display = window.getComputedStyle(buttonsContainerElem).display === 'block' ? 'none' : 'block'
    if (window.getComputedStyle(videoElem).opacity == 1) {
      videoElem.style.opacity = 0
      videoElem.style.width = '0'
      videoElem.style.height = '0'
      qrScanner.stop()
    } else {
      imgElem.style.display = 'none'
      videoElem.style.opacity = 1
      videoElem.style.width = 'auto'
      videoElem.style.height = 'auto'
    }
  }

  else if (media === 'file') {
    if (window.getComputedStyle(imgElem).display === 'none') {
      imgElem.style.display = 'block'
      imgElem.style.width = 'auto'
      imgElem.style.height = 'auto'
      const reader = new FileReader();
      reader.addEventListener('load', (e) => {
        imgElem.setAttribute('src', e.target.result);
      })
      reader.readAsDataURL(file.files[0]);
    }
  }
}
// code to register sw.js

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/qr_code_scanner/sw.js')
    .then(() => { console.log('Service Worker Registered'); });
}