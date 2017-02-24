
angular
  .module('walletApp')
  .directive('didYouKnow', didYouKnow);

didYouKnow.$inject = ['DidYouKnow'];

function didYouKnow (DidYouKnow) {
  const directive = {
    restrict: 'E',
    replace: true,
    templateUrl: 'templates/did-you-know.pug',
    link: link
  };
  return directive;

  function link (scope, elem, attrs) {
    scope.dyk = DidYouKnow.getRandom();
  }
}
