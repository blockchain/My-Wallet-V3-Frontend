
angular
  .module('walletApp')
  .directive('focusWhen', focusWhen);

focusWhen.$inject = ['$timeout'];

function focusWhen($timeout) {
  return {
    restrict: 'A',
    link: link
  };
  function link(scope, elem, attrs) {
    if (scope.$eval(attrs.focusWhen)) elem[0].focus();
  }
}
