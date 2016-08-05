angular
  .module('walletApp')
  .controller('SettingsCtrl', SettingsCtrl);

function SettingsCtrl ($scope, Wallet, Alerts, $state) {
  if ($state.current.name === 'wallet.common.settings') {
    $state.go('wallet.common.settings.info');
  }

  $scope.didLoad = () => {
    Alerts.clear();
    $scope.status = Wallet.status;
  };

  $scope.didLoad();
}
