angular
  .module('walletApp')
  .controller("SettingsImportedAddressesCtrl", SettingsImportedAddressesCtrl);

function SettingsImportedAddressesCtrl($scope, Wallet, $translate, $uibModal) {
  $scope.legacyAddresses = Wallet.legacyAddresses;
  $scope.display = {
    archived: false,
  };
  $scope.settings = Wallet.settings;

  $scope.toggleDisplayArchived = () => {
    $scope.display.archived = !$scope.display.archived;
    $scope.display.imported = false;
  };

  $scope.unarchive = (address) => { Wallet.unarchive(address) };

  $scope.delete = (address) => {
    $translate("LOSE_ACCESS").then((translation) => {
      if (confirm(translation)) {
        Wallet.deleteLegacyAddress(address);
        $scope.legacyAddresses = Wallet.legacyAddresses;
      }
    });
  };

  $scope.importAddress = () => {
    Wallet.clearAlerts();
    let modalInstance = $uibModal.open({
      templateUrl: "partials/settings/import-address.jade",
      controller: "AddressImportCtrl",
      windowClass: "bc-modal"
    });
    if (modalInstance != null) {
      modalInstance.opened.then(() => {
        Wallet.store.resetLogoutTimeout();
      });
    }
  };
}
