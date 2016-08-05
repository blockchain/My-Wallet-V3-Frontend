angular
  .module('walletApp')
  .controller('OpenLinkController', OpenLinkController);

function OpenLinkController ($scope, Wallet, $translate, $stateParams, $state, Alerts) {
  const paymentRequest = Wallet.parsePaymentRequest($stateParams.uri);
  Wallet.goal.send = paymentRequest;
  if (!Wallet.status.isLoggedIn) {
    Alerts.displayInfo('PLEASE_LOGIN_FIRST', true);
    $state.go('public.login-no-uid');
  }
}
