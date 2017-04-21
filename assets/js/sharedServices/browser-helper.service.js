angular
  .module('shared')
  .factory('BrowserHelper', BrowserHelper);

BrowserHelper.$inject = ['$window'];

function BrowserHelper ($window) {
  return {
    safeWindowOpen: safeWindowOpen
  };

  function safeWindowOpen (url) {
    let otherWindow = $window.open(url, '_blank');
    otherWindow.opener = null;
  }
}
