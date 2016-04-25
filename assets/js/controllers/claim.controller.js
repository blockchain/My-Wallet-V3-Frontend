angular
  .module('walletApp')
  .controller('ClaimCtrl', ClaimCtrl);

function ClaimCtrl ($scope, Wallet, $translate, $stateParams, $state, Alerts) {
  const balance = Wallet.fetchBalanceForRedeemCode($stateParams.code);
  Wallet.goal.claim = { code: $stateParams.code, balance: balance };
  if (!Wallet.status.isLoggedIn) {
    Alerts.displayInfo('Please login to your wallet or create a new one to proceed.', true);
    $state.go('public.login-no-uid');
  }
}
