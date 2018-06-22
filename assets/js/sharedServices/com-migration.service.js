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

  function isOnDotCom (env) {
    if (env == null) throw new Error('isOnDotCom expects an environment')
    return $window.location.origin === env.domains.comWalletApp
  }

  function isOnDotInfo (env) {
    if (env == null) throw new Error('isOnDotInfo expects an environment')
    return $window.location.origin === env.domains.root
  }

  function whenRedirectsEnabled (runCallback) {
    Env.then((env) => {
      if (isOnDotInfo(env) && env.enableDomainMigrationRedirects) {
        runCallback(env)
      }
    })
  }

  function redirectFromDotInfoTo (target) {
    Env.then((env) => {
      if (isOnDotInfo(env)) {
        $window.location = target
      }
    })
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

    Env.then((env) => {
      if (isOnDotCom(env) && shouldTransfer) {
        let frame = createFrame(`${env.domains.root}/Resources/transfer_stored_values.html`)

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
    }).catch((error) => {
      console.error('Error transferring cookies', error);
    })
  }
}
