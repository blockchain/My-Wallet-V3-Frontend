angular
  .module('walletApp')
  .controller("ResetTwoFactorTokenCtrl", ResetTwoFactorTokenCtrl);

function ResetTwoFactorTokenCtrl($scope, Wallet, $stateParams, $state, Alerts, $translate, $rootScope) {
  const success = (obj) => {

    $scope.checkingToken = false

    $translate(['SUCCESS']).then(translations => {
      $state.go("public.login-uid", {uid: obj.guid}).then(() =>{
        $rootScope.$emit('showNotification', {
          type: 'verified-email',
          icon: 'ti-email',
          heading: translations.SUCCESS,
          msg: obj.message
        });
      });
    });
  }

  const error = (message) => {
    $scope.checkingToken = false
    $state.go("public.login-no-uid");
    Alerts.displayError(message, true);
  }

  $scope.checkingToken = true

  Wallet.resetTwoFactorToken($stateParams.token, success, error)
}
