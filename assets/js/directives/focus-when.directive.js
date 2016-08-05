
angular
  .module('walletApp')
  .directive('focusWhen', focusWhen);

function focusWhen ($timeout) {
  return {
    restrict: 'A',
    scope: {
      trigger: '=focusWhen'
    },
    link: link
  };
  function link (scope, elem, attrs) {
    scope.$watch('trigger', (value) => {
      if (value) $timeout(() => elem[0].focus(), 100);
    });
  }
}
