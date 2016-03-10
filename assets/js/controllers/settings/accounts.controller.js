angular
  .module('walletApp')
  .controller("SettingsAccountsController", SettingsAccountsController);

function SettingsAccountsController($scope, Wallet, Alerts, $uibModal, filterFilter) {
  $scope.accounts = Wallet.accounts;
  $scope.display = {
    archived: false
  };

  $scope.addressBookPresent = Wallet.addressBook().length;

  $scope.numberOfActiveAccounts = () => {
    return Wallet.accounts().filter(a => !a.archived).length
  };

  $scope.getLegacyTotal = () => Wallet.total('imported');

  $scope.toggleAccount = (account) => {
    if (account.opened) { 
      $scope.resetAccount()
      return; 
    }

    Wallet.accounts().forEach(a => a.opened = false)
    account.opened = true;
    $scope.managingAccount = true;
    $scope.updateAccount(account.index)

  }

  $scope.resetAccount = () => {
    let account = Wallet.accounts().filter(a => a.opened)[0]
    $scope.managingAccount = false;
    account.opened = false;
  }

  $scope.newAccount = () => {
    Alerts.clear();
    let modalInstance = $uibModal.open({
      templateUrl: "partials/account-form.jade",
      controller: "AccountFormCtrl",
      resolve: {
        account: () => void 0
      },
      windowClass: "bc-modal"
    });
    if (modalInstance != null) {
      modalInstance.opened.then(() => {
        Wallet.store.resetLogoutTimeout();
      });
    }
  };

  $scope.editAccount = (account) => {
    Alerts.clear();
    let modalInstance = $uibModal.open({
      templateUrl: "partials/account-form.jade",
      controller: "AccountFormCtrl",
      resolve: {
        account: () => account
      },
      windowClass: "bc-modal"
    });
    if (modalInstance != null) {
      modalInstance.opened.then(() => {
        Wallet.store.resetLogoutTimeout();
      });
    }
  };

  $scope.revealXpub = (account) => {
    let modalInstance = $uibModal.open({
      templateUrl: "partials/reveal-xpub.jade",
      controller: "RevealXpubCtrl",
      resolve: {
        account: () => account
      },
      windowClass: "bc-modal"
    });
    if (modalInstance != null) {
      modalInstance.opened.then(() => {
        Wallet.store.resetLogoutTimeout();
      });
    }
  };

  $scope.makeDefault = (account) => {
    Wallet.setDefaultAccount(account);
    Wallet.saveActivity(3);
  };

  $scope.transfer = () => {
    let modalInstance = $uibModal.open({
      templateUrl: "partials/send.jade",
      controller: "SendCtrl",
      resolve: {
        paymentRequest: () => ({
          fromAccount: Wallet.accounts()[Wallet.getDefaultAccountIndex()],
          amount: 0
        })
      },
      windowClass: "bc-modal"
    });
    if (modalInstance != null) {
      modalInstance.opened.then(() => {
        Wallet.store.resetLogoutTimeout();
      });
    }
  };

  $scope.archive = (account) => { Wallet.archive(account) };
  $scope.unarchive = (account) => { Wallet.unarchive(account) };
  $scope.isDefault = (account) => Wallet.isDefaultAccount(account);

  // addresses
  $scope.updateAccount = (idx) => {
    $scope.edit = {address: {}};
    $scope.errors = {label: {}};

    $scope.hdAddresses = Wallet.hdAddresses(idx)

    $scope.settings = Wallet.settings;
    $scope.account = Wallet.accounts()[parseInt(idx)];

    $scope.createAddress = () => {
      Wallet.addAddressForAccount($scope.account, (() => {}), (e) => {
        $translate("LABEL_ERROR_BIP_44_GAP").then((translation) => {
          Alerts.displayError(translation);
        });
      });
    }
  }

}
