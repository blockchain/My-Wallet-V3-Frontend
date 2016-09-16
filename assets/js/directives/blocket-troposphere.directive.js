angular
  .module('walletApp')
  .directive('blocketTroposphere', blocketTroposphere);

function blocketTroposphere () {
  const directive = {
    restrict: 'E',
    replace: true,
    scope: {
      status: '@'
    },
    templateUrl: 'templates/blocket-troposphere.jade',
    link: link
  };

  return directive;

  function link (scope, elem, attrs) {
    scope.getRange = (n) => [...Array(n).keys()];
  }
}
