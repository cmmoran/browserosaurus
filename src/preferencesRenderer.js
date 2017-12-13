const electron = require('electron')
const browserList = document.getElementById('browserList')

const currentWindow = electron.remote.getCurrentWindow()

const toggleBrowser = (browserName, enabled) =>
  electron.ipcRenderer.send('toggle-browser', { browserName, enabled })

electron.ipcRenderer.on('incomingBrowsers', (event, message) => {
  emptiesPreferences()
  populatePreferences(message)
})

const emptiesPreferences = () => {
  while (browserList.firstChild) {
    browserList.removeChild(browserList.firstChild)
  }
}

const populatePreferences = installedBrowsers => {
  if (installedBrowsers.length > 0) {
    currentWindow.setSize(400, installedBrowsers.length * 64 + 48)
    installedBrowsers
      .map(browser => {
        // use alias as label if available, otherwise use name
        if (!browser.alias) {
          browser.alias = browser.name
        }
        return browser
      })
      .map(browser => {
        const li = document.createElement('li')

        const logo = document.createElement('img')
        logo.classList.add('browserLogo')
        logo.src = `images/browser-logos/${browser.name}.png`
        li.appendChild(logo)

        const name = document.createElement('span')
        name.classList.add('browserName')
        name.innerText = browser.alias
        li.appendChild(name)

        const checkboxWrapper = document.createElement('div')
        checkboxWrapper.classList.add('pretty')
        checkboxWrapper.classList.add('p-svg')

        const checkbox = document.createElement('input')
        checkbox.type = 'checkbox'
        checkboxWrapper.appendChild(checkbox)

        if (browser.enabled) {
          checkbox.checked = true
        }

        checkbox.addEventListener('change', e => {
          toggleBrowser(browser.name, e.target.checked)
        })

        const checkState = document.createElement('div')
        checkState.classList.add('state')
        checkState.classList.add('p-success')
        checkState.innerHTML = `
    <svg class="svg svg-icon" viewBox="0 0 20 20">
      <path d="M7.629,14.566c0.125,0.125,0.291,0.188,0.456,0.188c0.164,0,0.329-0.062,0.456-0.188l8.219-8.221c0.252-0.252,0.252-0.659,0-0.911c-0.252-0.252-0.659-0.252-0.911,0l-7.764,7.763L4.152,9.267c-0.252-0.251-0.66-0.251-0.911,0c-0.252,0.252-0.252,0.66,0,0.911L7.629,14.566z" style="stroke: white;fill:white;"></path>
    </svg>
    <label></label>`
        // const checkLabel = document.createElement('label')
        // checkState.appendChild(checkLabel)

        checkboxWrapper.appendChild(checkState)

        li.appendChild(checkboxWrapper)

        browserList.appendChild(li)
      })
  } else {
    const listItem = document.createElement('li')

    listItem.innerText = 'Loading...'

    browserList.appendChild(listItem)
    currentWindow.setSize(400, 64 + 48)
  }
}
