angular
  .module('walletApp')
  .controller("SettingsAddressesCtrl", SettingsAddressesCtrl);

function SettingsAddressesCtrl($scope, Wallet, $translate, $modal, $state, addressOrNameMatchFilter) {
  $scope.legacyAddresses = Wallet.legacyAddresses;
  $scope.display = {
    archived: false,
    account_dropdown_open: false
  };
  $scope.accounts = Wallet.accounts;
  $scope.hdAddresses = Wallet.hdAddresses;
  $scope.settings = Wallet.settings;

  $scope.toggleDisplayImported = () => {
    $scope.display.imported = !$scope.display.imported;
    $scope.display.archived = false;
  };

  $scope.toggleDisplayArchived = () => {
    $scope.display.archived = !$scope.display.archived;
    $scope.display.imported = false;
  };

  $scope.addAddressForAccount = (account) => {
    const success = (index) => {
      $state.go("wallet.common.settings.hd_address", {
        account: account.index,
        index: index
      });
    };
    const error = () => {
    };

    Wallet.addAddressForAccount(account, success, error);
  };

  $scope.clear = (request) => {
    Wallet.cancelPaymentRequest(request.account, request.address);
  };

  $scope.archive = (address) => { Wallet.archive(address) };
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
    let modalInstance = $modal.open({
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

  $scope.transfer = (address) => {
    let modalInstance = $modal.open({
      templateUrl: "partials/send.jade",
      controller: "SendCtrl",
      windowClass: "bc-modal",
      resolve: {
        paymentRequest: () => ({
          fromAddress: address,
          amount: 0,
          toAccount: Wallet.accounts()[Wallet.getDefaultAccountIndex()]
        })
      }
    });
    if (modalInstance != null) {
      modalInstance.opened.then(() => {
        Wallet.store.resetLogoutTimeout();
      });
    }
  };

  $scope.signMessage = () => {
    Wallet.clearAlerts();

    $modal.open({
      templateUrl: "partials/signMessage.jade",
      controller: "SignMessageCtrl",
      windowClass: "blockchain-modal"
    });

  }


  $scope.showPrivKey = (address) => {
    let modalInstance = $modal.open({
      templateUrl: "partials/settings/show-private-key.jade",
      controller: "ShowPrivateKeyCtrl",
      windowClass: "bc-modal",
      resolve: {
        addressObj: () => address
      }
    });
    if (modalInstance != null) {
      modalInstance.opened.then(() => {
        Wallet.store.resetLogoutTimeout();
      });
    }
  };

  $scope.didLoad = () => {
    $scope.requests = Wallet.paymentRequests;
  };

  $scope.didLoad();

}
