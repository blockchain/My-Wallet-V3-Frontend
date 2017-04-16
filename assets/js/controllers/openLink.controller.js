angular
  .module('walletApp')
  .controller('OpenLinkController', OpenLinkController);

function OpenLinkController ($scope, Wallet, $translate, $location, $state, Alerts) {
  const paymentRequest = Wallet.parsePaymentRequest($location.url().split('/open/')[1]);
  Wallet.goal.send = paymentRequest;
  if (!Wallet.status.isLoggedIn) {
    Alerts.displayInfo('PLEASE_LOGIN_FIRST', true);
    $state.go('public.login-no-uid');
  }
}
