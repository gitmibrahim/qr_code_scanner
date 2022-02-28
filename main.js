

const buttonsContainerElem = document.querySelector('.buttons')
const startScanningButtonElem = document.querySelector('#scan')
const videoElem = document.querySelector('video')
const imgElem = document.querySelector('img')

const cancelButtonElem = document.querySelector('#cancel')
const warningElem = document.querySelector('#warning')

const resultsElem = document.querySelector('#results')
const file = document.querySelector('#file');


Element.prototype.show = function(prop = 'block') {this.style.display = prop}
Element.prototype.hide = function(prop = 'none') {this.style.display = prop}
Element.prototype.toggleDisplay = function(display = 'block') {window.getComputedStyle(this).display === display ? this.hide() : this.show(display)}

HTMLVideoElement.prototype.showVideo = function() {this.style.opacity = 1;this.style.width = 'auto';this.style.height = 'auto'}
HTMLVideoElement.prototype.hideVideo = function() {this.style.opacity = 0;this.style.width = 0;this.style.height = 0}

HTMLImageElement.prototype.showImage = function() {this.style.display = 'block';this.style.width = 'auto';this.style.height = 'auto'}
HTMLImageElement.prototype.hideImage = function() {this.style.display = 'none';this.style.width = 0;this.style.height = 0}


const qrScanner = new QrScanner(videoElem, ({data}) => {
  decodeTheScan(data, 'cam')
  qrScanner.stop()
}, {
  returnDetailedScanResult: true,
  highlightScanRegion: true
});


startScanningButtonElem.addEventListener('click', () => {
  toggleButtonAndVideoDisplay('cam')
  qrScanner.start()
})

file.addEventListener('change', () => {
  QrScanner.scanImage(file.files[0], {returnDetailedScanResult: true})
    .then(({data}) => {
      try {
        decodeTheScan(data, 'file')
      } catch(e) {
        // Not a valid ZATCA Qr Code
        buttonsContainerElem.hide()
        cancelButtonElem.show()
        warningElem.show()
      }
    })
    .catch(error => console.log(error || 'No QR code found.'));
})

cancelButtonElem.addEventListener('click', () => {
  cancelButtonElem.hide()
  imgElem.hideImage()
  qrScanner.stop()
  videoElem.hideVideo()
  warningElem.hide()
  buttonsContainerElem.show()
})

function decodeTheScan(data, media) {
  // data(base64) -> hex -> TLV -> text
  const hex = base64ToHex(data)
  const parts = hexToTlv(hex)
  const result = tlvToText(parts)
  
  printTheOutput(result, media)
}

function printTheOutput(data, media) {
  resultsElem.show('inline-block')
  const childUl = document.createElement('ul')
  const prefixLi = document.createElement('li')

  data.map(result => {
    const li = document.createElement('li')
    li.textContent = JSON.stringify(result)
    childUl.appendChild(li)
  })

  resultsElem.appendChild(prefixLi)
  resultsElem.appendChild(childUl)
  resultsElem.scrollBy({
    top: resultsElem.scrollHeight,
    behavior: 'smooth'
  })

  toggleButtonAndVideoDisplay(media)
}

const toggleButtonAndVideoDisplay = (media) => {
  buttonsContainerElem.toggleDisplay()
  if (media === 'cam') {
    if (window.getComputedStyle(videoElem).opacity == 1) {
      videoElem.hideVideo()
      cancelButtonElem.hide()
      qrScanner.stop()
    } else {
      videoElem.showVideo()
      cancelButtonElem.show()
    }
  }

  else if (media === 'file') {
    if (window.getComputedStyle(imgElem).display === 'none') {
      imgElem.showImage()
      const reader = new FileReader();
      reader.addEventListener('load', (e) => {
        imgElem.setAttribute('src', e.target.result);
      })
      reader.readAsDataURL(file.files[0]);
      cancelButtonElem.show()
    }
  }
}

// Helper functions to decode
const base64ToHex = data => {
  const raw = atob(data);
  let result = '';
  for (let i = 0; i < raw.length; i++) {
    const hex = raw.charCodeAt(i).toString(16);
    result += (hex.length === 2 ? hex : '0' + hex);
  }
  return result.toUpperCase();
}

const hexToTlv = hex => {
  const hexSplit = hex.match(/.{1,2}/g) // split to Bytes

  const parts = {tags: [], lengths: [], values: [], result: []}
  let count = 1

  for (let i=0; i<hexSplit.length; i++) {
    const curr = hexSplit[i]
    if (curr === '01' || curr === '02' || curr === '03' || curr === '04' || curr === '05') {
      parts.tags.push({[count]: curr})
      parts.lengths.push({[count]: hexSplit[++i]})
      parts.values.push({[count]: ''})
      count++
    } else {
      parts.values[count - 2][count - 1] += curr
    }
  }

  return parts
}

const tlvToText = parts => {
  let count = 1
  parts.values.map((value, index) => {
    tag = parseInt(parts.tags[index][count])
    length = parseInt(parts.lengths[index][count], 16)
    value[count] = decodeURIComponent('%' + value[count].match(/.{1,2}/g).join('%'))

    parts.result.push({tag, length, value: value[count]})
    count++
  })
  return parts.result
}

// code to register sw.js
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/qr_code_scanner/sw.js')
    .then(() => { console.log('Service Worker Registered'); });
}