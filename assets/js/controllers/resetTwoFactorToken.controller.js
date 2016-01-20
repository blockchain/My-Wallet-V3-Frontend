angular
  .module('walletApp')
  .controller("ResetTwoFactorTokenCtrl", ResetTwoFactorTokenCtrl);

function ResetTwoFactorTokenCtrl($scope, WalletNetwork, $stateParams, $state, Alerts, $translate, $rootScope) {
  const success = (obj) => {

    $scope.checkingToken = false

    $state.go("public.login-uid", {uid: obj.guid}).then(() =>{
      Alerts.displayResetTwoFactor(obj.message)
    });
  }

  const error = (message) => {
    $scope.checkingToken = false
    $state.go("public.login-no-uid");
    Alerts.displayError(message, true);
  }

  $scope.checkingToken = true

  WalletNetwork.resetTwoFactorToken($stateParams.token).then(success).catch(error);
}
