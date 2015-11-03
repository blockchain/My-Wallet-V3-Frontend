angular
  .module('walletApp')
  .controller("SettingsAddressesCtrl", SettingsAddressesCtrl);

function SettingsAddressesCtrl($scope, Wallet, addressOrNameMatchFilter, $stateParams, filterFilter) {
  $scope.edit = {address: {}};
  $scope.errors = {label: {}};

  $scope.hdAddresses = Wallet.hdAddresses($stateParams.account)

  $scope.settings = Wallet.settings;
  $scope.account = $stateParams.account;
}
