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
    if ($cookies.get('password')) {
      localStorageService.set('password', $cookies.get('password'));
      $cookies.remove('password');
    }

    if ($cookies.get('uid')) {
      localStorageService.set('guid', $cookies.get('uid'));
      $cookies.remove('uid');
    }

    if ($cookies.get('session')) {
      localStorageService.set('session', $cookies.get('session'));
      $cookies.remove('session');
    }
  }
}
