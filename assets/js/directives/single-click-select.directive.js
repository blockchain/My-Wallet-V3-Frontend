
angular
  .module('walletApp')
  .directive('singleClickSelect', singleClickSelect);

function singleClickSelect ($window, AngularHelper, browser) {
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

      if (browser.canExecCommand) {
        $window.document.execCommand('copy');
        AngularHelper.$safeApply();
      }

      document.body.removeChild(hidden);
    };

    elem.bind('click', scope.select);

    scope.$watch(() => elem[0].textContent.toString(), (newVal, oldVal) => {
      if (newVal !== oldVal) scope.highlighted = false;
    });
  }
}
