angular
  .module('walletApp')
  .controller('SettingsImportedAddressesCtrl', SettingsImportedAddressesCtrl);

function SettingsImportedAddressesCtrl ($scope, Wallet, Alerts, $translate, $uibModal, $ocLazyLoad) {
  $scope.legacyAddresses = Wallet.legacyAddresses;
  $scope.display = { archived: false };
  $scope.settings = Wallet.settings;

  $scope.toggleDisplayArchived = () => {
    $scope.display.archived = !$scope.display.archived;
    $scope.display.imported = false;
  };

  $scope.activeSpendableAddresses = () => Wallet.legacyAddresses().filter(a => a.active && !a.isWatchOnly && a.balance > 0);
  $scope.hasLegacyAddress = () => $scope.activeSpendableAddresses().length > 0;

  $scope.unarchive = (address) => Wallet.unarchive(address);

  $scope.delete = (address) => {
    Alerts.confirm('CONFIRM_LOSE_ACCESS').then(() => {
      Wallet.deleteLegacyAddress(address);
      $scope.legacyAddresses = Wallet.legacyAddresses;
    });
  };

  $scope.importAddress = () => {
    Alerts.clear();
    $uibModal.open({
      templateUrl: 'partials/settings/import-address.pug',
      controller: 'AddressImportCtrl',
      windowClass: 'bc-modal',
      resolve: {
        address: () => null,
        loadBcQrReader: () => {
          return $ocLazyLoad.load('bcQrReader');
        }
      }
    });
  };
}
