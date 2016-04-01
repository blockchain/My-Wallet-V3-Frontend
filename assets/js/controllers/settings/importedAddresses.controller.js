angular
  .module('walletApp')
  .controller("SettingsImportedAddressesCtrl", SettingsImportedAddressesCtrl);

function SettingsImportedAddressesCtrl($scope, Wallet, Alerts, $translate, $uibModal) {
  $scope.legacyAddresses = Wallet.legacyAddresses;
  $scope.display = { archived: false };
  $scope.settings = Wallet.settings;

  $scope.activeSpendableAddresses = () => Wallet.legacyAddresses().filter(a => a.active && !a.isWatchOnly);

  $scope.toggleDisplayArchived = () => {
    $scope.display.archived = !$scope.display.archived;
    $scope.display.imported = false;
  };

  $scope.unarchive = (address) => { Wallet.unarchive(address) };

  $scope.delete = (address) => {
    Alerts.confirm('LOSE_ACCESS').then(() => {
      Wallet.deleteLegacyAddress(address);
      $scope.legacyAddresses = Wallet.legacyAddresses;
    });
  };

  $scope.importAddress = () => {
    Alerts.clear();
    $uibModal.open({
      templateUrl: "partials/settings/import-address.jade",
      controller: "AddressImportCtrl",
      windowClass: "bc-modal",
      backdrop: "static",
      resolve: {
        address: () => null
      }
    });
  };

  $scope.sweepAll = () => {
    $uibModal.open({
      templateUrl: "partials/settings/sweep-all.jade",
      controller: "SweepAllController",
      windowClass: "bc-modal auto",
      backdrop: "static"
    });
  };
}
