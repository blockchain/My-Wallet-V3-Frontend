angular
  .module('walletApp')
  .controller("SettingsImportedAddressesCtrl", SettingsImportedAddressesCtrl);

function SettingsImportedAddressesCtrl($scope, Wallet, Alerts, $translate, $uibModal) {
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
    Alerts.confirm('LOSE_ACCESS').then(() => {
      Wallet.deleteLegacyAddress(address);
      $scope.legacyAddresses = Wallet.legacyAddresses;
    });
  };

  $scope.importAddress = () => {
    Alerts.clear();
    let modalInstance = $uibModal.open({
      templateUrl: "partials/settings/import-address.jade",
      controller: "AddressImportCtrl",
      windowClass: "bc-modal",
      backdrop: "static",
      resolve: {
        address: () => null
      }
    });
    if (modalInstance != null) {
      modalInstance.opened.then(() => {
        Wallet.store.resetLogoutTimeout();
      });
    }
  };

  $scope.archived = () => { 
    return $scope.legacyAddresses().filter(a => a.archived)
  }
  $scope.watchOnly = () => { 
    return $scope.legacyAddresses().filter(a => a.isWatchOnly) 
  }
  $scope.spendable = () => { 
    return $scope.legacyAddresses().filter(a => !a.archived && !a.isWatchOnly) 
  }

  $scope.$on('importAddress', $scope.importAddress);
}
