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

  $scope.newAccount = () => {
    Alerts.clear();
    $uibModal.open({
      templateUrl: "partials/account-form.jade",
      controller: "AccountFormCtrl",
      resolve: {
        account: () => void 0
      },
      windowClass: "bc-modal"
    });
  };

  $scope.editAccount = (account) => {
    Alerts.clear();
    $uibModal.open({
      templateUrl: "partials/account-form.jade",
      controller: "AccountFormCtrl",
      resolve: {
        account: () => account
      },
      windowClass: "bc-modal"
    });
  };

  $scope.revealXpub = (account) => {
    $uibModal.open({
      templateUrl: "partials/reveal-xpub.jade",
      controller: "RevealXpubCtrl",
      resolve: {
        account: () => account
      },
      windowClass: "bc-modal"
    });
  };

  $scope.makeDefault = (account) => {
    Wallet.setDefaultAccount(account);
    Wallet.saveActivity(3);
  };

  $scope.transfer = () => {
    $uibModal.open({
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
  };

  $scope.archive = (account) => { Wallet.archive(account) };
  $scope.unarchive = (account) => { Wallet.unarchive(account) };
  $scope.isDefault = (account) => Wallet.isDefaultAccount(account);
}
