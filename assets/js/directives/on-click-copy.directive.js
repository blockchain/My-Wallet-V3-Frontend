
angular
  .module('walletApp')
  .directive('onClickCopy', onClickCopy);

function onClickCopy ($window, $document, browser) {
  const directive = {
    restrict: 'A',
    scope: false,
    link: link
  };
  return directive;

  function link (scope, elem, attrs) {
    scope.copy = () => {
      let text = scope.$eval(attrs.onClickCopy);

      if (!angular.isString(text) || text.length === 0) {
        return;
      }

      let textElem = angular.element(`<span>${text}</span>`);
      textElem.css({ position: 'absolute', left: '-1000px' });
      angular.element($document[0].body).append(textElem);

      let range = $window.document.createRange();
      range.setStartBefore(textElem[0].firstChild);
      range.setEndAfter(textElem[0].lastChild);

      let selection = $window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);

      $window.document.execCommand('copy');
      textElem.remove();
    };

    if (browser.canExecCommand) {
      elem.on('click', scope.copy);
      scope.$on('$destroy', () => elem.off('click', scope.copy));
    }
  }
}
