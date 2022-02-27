

const startButtonElem = document.querySelector('button')
const videoElem = document.querySelector('video')
const resultsElem = document.querySelector('#results')


let latestResult = ''
let latestPrintedResult
let duplicateCount = 1
let duplicateSpan

startButtonElem.addEventListener('click', () => {
  toggleButtonAndVideoDisplay()
  qrScanner.start()
})


const qrScanner = new QrScanner(videoElem, ({data}) => {
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

  toggleButtonAndVideoDisplay()
}, {
  returnDetailedScanResult: true
});


const toggleButtonAndVideoDisplay = () => {
  startButtonElem.style.display = window.getComputedStyle(startButtonElem).display === 'block' ? 'none' : 'block'
  if (window.getComputedStyle(videoElem).opacity == 1) {
    videoElem.style.opacity = 0
    videoElem.style.width = '0'
    qrScanner.stop()
  } else {
    videoElem.style.opacity = 1
    videoElem.style.width = '100%'
  }
}

