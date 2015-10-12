angular
  .module('walletApp')
  .controller("SettingsCtrl", SettingsCtrl);

function SettingsCtrl($scope, Wallet, $cookieStore, $state) {
  if ($state.current.name === "wallet.common.settings") {
    $state.go("wallet.common.settings.info");
  }

  $scope.didLoad = () => {
    Wallet.clearAlerts();
    $scope.status = Wallet.status;
  };

  $scope.didLoad();
}
