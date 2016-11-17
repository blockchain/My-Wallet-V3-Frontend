
angular
  .module('walletDirectives')
  .directive('didYouKnow', didYouKnow);

didYouKnow.$inject = ['DidYouKnow'];

function didYouKnow (DidYouKnow) {
  const directive = {
    restrict: 'E',
    replace: true,
    templateUrl: 'templates/did-you-know.jade',
    link: link
  };
  return directive;

  function link (scope, elem, attrs) {
    scope.dyk = DidYouKnow.getRandom();
  }
}
