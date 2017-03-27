
angular
  .module('walletApp')
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
      let hidden = document.createElement('input');

      hidden.setAttribute('value', attrs.copyContent);
      document.body.appendChild(hidden);
      hidden.select();

      if (scope.browserCanExecCommand) {
        $window.document.execCommand('copy');
        scope.$safeApply();
      }

      document.body.removeChild(hidden);
    };

    elem.bind('click', scope.select);

    scope.$watch(() => elem[0].textContent.toString(), (newVal, oldVal) => {
      if (newVal !== oldVal) scope.highlighted = false;
    });
  }
}
