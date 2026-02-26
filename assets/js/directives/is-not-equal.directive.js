
angular
  .module('walletDirectives')
  .directive('isNotEqual', isNotEqual);

isNotEqual.$inject = ['Wallet'];

function isNotEqual (Wallet) {
  const directive = {
    restrict: 'A',
    require: 'ngModel',
    link: link
  };
  return directive;

  function link (scope, elem, attrs, ctrl) {
    ctrl.$validators.isNotEqual = (modelValue, viewValue) => {
      return attrs.isNotEqual !== viewValue;
    };
  }
}
