angular.module('walletApp').controller("OpenLinkController", ($scope, Wallet, $translate, $stateParams, $state) => {
  const paymentRequest = Wallet.parsePaymentRequest($stateParams.uri);
  Wallet.goal.send = paymentRequest;
  if (!Wallet.status.isLoggedIn) {
    $translate("PLEASE_LOGIN_FIRST").then(translation => {
      Wallet.displayInfo(translation, true);
    });
    $state.go("login.show");
  }
});
