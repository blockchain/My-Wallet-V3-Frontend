angular
  .module('walletDirectives')
  .directive('isValid', isValid);

function isValid () {
  const directive = {
    restrict: 'A',
    require: 'ngModel',
    link: link
  };
  return directive;

  function link (scope, elem, attrs, ctrl) {
    let setValidity = () => ctrl.$setValidity('isValid', scope.$eval(attrs.isValid));
    ctrl.$formatters.push((v) => { setValidity(); return v; });
    ctrl.$viewChangeListeners.push(setValidity);
  }
}
