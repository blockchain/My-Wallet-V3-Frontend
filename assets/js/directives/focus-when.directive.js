
angular
  .module('walletApp')
  .directive('focusWhen', focusWhen);

function focusWhen ($timeout) {
  return {
    restrict: 'A',
    link: link
  };
  function link (scope, elem, attrs) {
    let shouldFocus = scope.$eval(attrs.focusWhen);
    $timeout(() => shouldFocus && elem[0].focus());
  }
}
