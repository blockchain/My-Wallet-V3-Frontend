
angular
  .module('walletApp')
  .directive('focusWhen', focusWhen);

function focusWhen ($timeout) {
  return {
    restrict: 'A',
    link: link
  };
  function link (scope, elem, attrs) {
    scope.$watch(attrs.focusWhen, (value) => {
      if (value) $timeout(() => elem[0].focus(), 100);
    });
  }
}
