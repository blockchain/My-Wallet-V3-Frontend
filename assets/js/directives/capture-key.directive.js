angular
  .module('walletApp')
  .directive('captureKey', captureKey);

function captureKey ($document, $timeout) {
  return {
    restrict: 'A',
    link
  };

  function link (scope, elem, attrs) {
    let body = $document.find('body');
    let capture = scope.$eval(attrs.captureKey);

    let keydownHandler = (event) => {
      let handler = capture[event.key];
      handler && $timeout(() => { handler(event); });
    };

    body.on('keydown', keydownHandler);

    scope.$on('$destroy', () => {
      body.off('keydown', keydownHandler);
    });
  }
}
