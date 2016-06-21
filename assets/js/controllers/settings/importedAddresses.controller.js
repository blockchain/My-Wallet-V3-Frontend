angular
  .module('walletApp')
  .controller('SettingsImportedAddressesCtrl', SettingsImportedAddressesCtrl);

function SettingsImportedAddressesCtrl ($scope, Wallet, Alerts, $translate, $uibModal) {
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
    Alerts.confirm('LOSE_ACCESS').then(() => {
      Wallet.deleteLegacyAddress(address);
      $scope.legacyAddresses = Wallet.legacyAddresses;
    });
  };

  $scope.openVerifyMessage = () => $uibModal.open({
    templateUrl: 'partials/settings/verify-message.jade',
    controller: 'VerifyMessageController',
    windowClass: 'bc-modal initial'
  });

  $scope.importAddress = () => {
    Alerts.clear();
    $uibModal.open({
      templateUrl: 'partials/settings/import-address.jade',
      controller: 'AddressImportCtrl',
      windowClass: 'bc-modal',
      resolve: {
        address: () => null
      }
    });
  };

  $scope.openTransferAll = () => $uibModal.open({
    templateUrl: 'partials/settings/transfer.jade',
    controller: 'TransferController',
    windowClass: 'bc-modal',
    resolve: { address: () => $scope.activeSpendableAddresses() }
  });
}
