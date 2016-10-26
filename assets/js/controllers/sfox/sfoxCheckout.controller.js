angular
  .module('walletApp')
  .controller('SfoxCheckoutController', SfoxCheckoutController);

function SfoxCheckoutController ($scope, $state, exchange) {
  if (exchange.profile == null) {
    $state.go('wallet.common.buy-sell.sfox.signup', { step: 'create' });
  }
}
