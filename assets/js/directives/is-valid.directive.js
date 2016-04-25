angular
  .module('walletApp')
  .directive('isValid', isValid);

function isValid () {
  const directive = {
    restrict: 'A',
    require: 'ngModel',
    link: link
  };
  return directive;

  function link (scope, elem, attrs, ctrl) {
    ctrl.$viewChangeListeners.push(() => {
      ctrl.$setValidity('isValid', scope.$eval(attrs.isValid));
    });
  }
}
