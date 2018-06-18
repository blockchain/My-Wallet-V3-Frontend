angular
  .module('shared')
  .factory('ComMigration', ComMigration)

ComMigration.$inject = ['$rootScope', '$window', 'localStorageService', 'Env']

function ComMigration ($rootScope, $window, localStorageService, Env) {
  const events = {
    TRANSFERRED_COOKIES: 'ComMigration.TRANSFERRED_COOKIES'
  }

  return {
    events,
    isOnDotCom,
    isOnDotInfo,
    whenRedirectsEnabled,
    redirectFromDotInfoTo,
    transferCookiesFromDotInfo
  }

  function isOnDotCom () {
    return $window.location.origin === 'https://login.blockchain.com'
  }

  function isOnDotInfo () {
    return $window.location.origin === 'https://blockchain.info'
  }

  function whenRedirectsEnabled (runCallback) {
    Env.then((env) => {
      if (isOnDotInfo() && env.enableDomainMigrationRedirects) {
        runCallback()
      }
    })
  }

  function redirectFromDotInfoTo (target) {
    if (isOnDotInfo()) {
      $window.location = target
    }
  }

  function transferCookiesFromDotInfo () {
    let alreadyTransferredCookiesKey = 'did_already_transfer_cookies_from_dot_info'
    let shouldTransfer = localStorageService.get(alreadyTransferredCookiesKey) == null

    let createFrame = (src) => {
      let frame = document.createElement('iframe')
      frame.src = src
      frame.style.display = 'none'
      document.body.appendChild(frame)
      return frame
    }

    if (isOnDotCom() && shouldTransfer) {
      let frame = createFrame('https://blockchain.info/transfer_cookies.html')

      $window.addEventListener('message', (event) => {
        if (event.data.type === 'cookie') {
          let cookie = event.data.payload
          localStorageService.set(cookie.id, cookie.data)
        }

        if (event.data.type === 'cookies-sent') {
          frame.remove()
          localStorageService.set(alreadyTransferredCookiesKey, 'yes')
          $rootScope.$broadcast(events.TRANSFERRED_COOKIES)
        }
      })
    }
  }
}
