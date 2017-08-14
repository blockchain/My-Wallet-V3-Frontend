
angular
  .module('walletDirectives')
  .directive('didYouKnow', didYouKnow);

didYouKnow.$inject = ['DidYouKnow', 'Ethereum'];

function didYouKnow (DidYouKnow, Ethereum) {
  const directive = {
    restrict: 'E',
    replace: true,
    templateUrl: 'templates/did-you-know.pug',
    link: link
  };
  return directive;

  function link (scope, elem, attrs) {
    let showEthereum = Ethereum.userHasAccess || void 0;
    scope.textValues = { showEthereum };
    scope.dyk = DidYouKnow.getRandom();
  }
}
