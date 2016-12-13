
angular
  .module('walletDirectives')
  .directive('tor', tor);

function tor ($translate, Wallet) {
  const directive = {
    restrict: 'E',
    replace: true,
    scope: {
      _buttonClass: '@buttonClass'
    },
    templateUrl: 'templates/tor.jade',
    link: link
  };
  return directive;

  function link (scope, elem, attrs) {
    scope.buttonClass = scope._buttonClass || 'button-primary';
    scope.settings = Wallet.settings;
    scope.enableBlockTOR = () => Wallet.enableBlockTOR();
    scope.disableBlockTOR = () => Wallet.disableBlockTOR();
  }
}
