angular
  .module('walletApp')
  .controller("SettingsCtrl", SettingsCtrl);

function SettingsCtrl($scope, Wallet, $cookieStore, $state) {
  if ($state.current.name === "settings") {
    $state.go("settings.my-details");
  }

  $scope.didLoad = () => {
    Wallet.clearAlerts();
    $scope.status = Wallet.status;
  };

  $scope.didLoad();
}
