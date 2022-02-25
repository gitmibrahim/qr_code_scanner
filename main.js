

const videoElem = document.querySelector('video')
const resultsElem = document.querySelector('#results')

let latestResult = ''
let latestPrintedResult
let duplicateCount = 1
let duplicateSpan

const qrScanner = new QrScanner(videoElem, result => {
  if (result !== latestResult) {
    const li = document.createElement('li')
    li.textContent = result
    resultsElem.appendChild(li)

    latestResult = result
    latestPrintedResult = li
    duplicateCount = 1
    duplicateSpan = document.createElement('span')

  } else {
    duplicateSpan.textContent = ` (${++duplicateCount})`
    if (duplicateCount == 2) {
      latestPrintedResult.appendChild(duplicateSpan)
    }
  }
});

qrScanner.start();

