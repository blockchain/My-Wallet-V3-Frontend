
angular
  .module('walletDirectives')
  .directive('singleClickSelect', singleClickSelect);

function singleClickSelect ($window) {
  const directive = {
    restrict: 'A',
    scope: false,
    link: link
  };
  return directive;

  function link (scope, elem, attrs) {
    scope.highlighted = false;

    scope.select = () => {
      let text = elem[0];

      let range = $window.document.createRange();
      range.setStartBefore(text.firstChild);
      range.setEndAfter(text.lastChild);

      let selection = $window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);

      if ($window.getSelection().toString() !== '') {
        scope.highlighted = true;
        elem.addClass('highlighted');
      }
      if (scope.browserCanExecCommand) {
        $window.document.execCommand('copy');
        scope.$safeApply();
      }
    };

    elem.bind('click', scope.select);

    scope.$watch(() => elem[0].textContent.toString(), (newVal, oldVal) => {
      if (newVal !== oldVal) scope.highlighted = false;
    });
  }
}
