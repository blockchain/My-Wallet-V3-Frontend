
angular
  .module('walletApp')
  .directive('didYouKnow', didYouKnow);

didYouKnow.$inject = ['DidYouKnow'];

function didYouKnow(DidYouKnow) {
  const directive = {
    restrict: 'E',
    replace: true,
    templateUrl: 'templates/did-you-know.jade',
    link: link
  };
  return directive;

  function link(scope, elem, attrs) {
    scope.getRandInRange = (min, max) => {
      return Math.floor(Math.random() * (max - min + 1) + min);
    };
    let randDYKIndex = scope.getRandInRange(0, DidYouKnow.dyks.length - 1);
    scope.dyk = DidYouKnow.dyks[randDYKIndex];
  }
}
