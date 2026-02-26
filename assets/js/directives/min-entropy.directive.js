angular
  .module('walletDirectives')
  .directive('minEntropy', minEntropy);

function minEntropy (MyWalletHelpers) {
  const directive = {
    restrict: 'A',
    require: 'ngModel',
    link: link
  };
  return directive;

  function link (scope, elem, attrs, ctrl) {
    let minimum = parseFloat(attrs.minEntropy);

    let checkEntropy = (viewValue) => {
      let score = MyWalletHelpers.scorePassword(viewValue);
      ctrl.$setValidity('minEntropy', score > minimum);
      return viewValue;
    };

    ctrl.$parsers.push(checkEntropy);
  }
}
