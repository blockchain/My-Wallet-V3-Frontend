angular
  .module('shared')
  .factory('BrowserHelper', BrowserHelper);

BrowserHelper.$inject = ['$window', '$cookies', 'localStorageService'];

function BrowserHelper ($window, $cookies, localStorageService) {
  return {
    safeWindowOpen: safeWindowOpen,
    migrateCookiesToLocalStorage: migrateCookiesToLocalStorage
  };

  function safeWindowOpen (url) {
    let otherWindow = $window.open(url, '_blank');
    otherWindow.opener = null;
  }

  function migrateCookiesToLocalStorage () {
    // Migrate any cookies to local storage:
    if ($cookies.get('uid')) {
      localStorageService.set('guid', $cookies.get('uid'));
      $cookies.remove('uid');
    }

    // Replace 'true' with true
    for (let key of [
      'qa-tools-enabled',
      'buy-alert-seen'
    ]) {
      if ($cookies.get(key)) {
        localStorageService.set(
          key,
          $cookies.get(key) === 'true'
        );
      }
    }

    // Convert cookie keys to localstorage
    for (let key of [
      'password',
      'session',
      'subscribed',
      'whatsNewViewed',
      'backup-reminder',
      'logout-survey',
      'theme',
      'reload.url',
      'alert-warning',
      'alert-success'
    ]) {
      if ($cookies.get(key)) {
        localStorageService.set(key, $cookies.get(key));
        $cookies.remove(key);
      }
    }

    // Convert cookie objects to localstorage:
    for (let key of [
      'buy-bitcoin-reminder',
      'sentEmailCode',
      'sentMobileCode',
      'survey-opened',
      'sfox-survey',
      'contextual-message'
    ]) {
      if ($cookies.getObject(key)) {
        localStorageService.set(key, $cookies.getObject(key));
        $cookies.remove(key);
      }
    }
  }
}
