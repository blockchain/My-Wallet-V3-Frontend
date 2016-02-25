angular
  .module('walletApp')
  .controller("SettingsAddressesCtrl", SettingsAddressesCtrl);

function SettingsAddressesCtrl($scope, Wallet, Alerts, addressOrNameMatchFilter, $stateParams, filterFilter, $translate) {
  $scope.edit = {address: {}};
  $scope.errors = {label: {}};

  $scope.hdAddresses = Wallet.hdAddresses($stateParams.account)

  $scope.settings = Wallet.settings;
  $scope.account = Wallet.accounts()[parseInt($stateParams.account)];

  $scope.createAddress = () => {
    Wallet.addAddressForAccount($scope.account, (() => {}), (e) => {
      $translate("LABEL_ERROR_BIP_44_GAP").then((translation) => {
        Alerts.displayError(translation);
      });
    });
  }

  $scope.$on('createAddress', $scope.createAddress)
}
