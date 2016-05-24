angular
  .module('walletApp')
  .controller('SettingsAccountsController', SettingsAccountsController);

function SettingsAccountsController ($scope, Wallet, Alerts, $uibModal, filterFilter, $ocLazyLoad) {
  $scope.accounts = Wallet.accounts;
  $scope.activeSpendableAddresses = () => Wallet.legacyAddresses().filter(a => a.active && !a.isWatchOnly && a.balance > 0);

  $scope.display = {
    archived: false
  };

  $scope.addressBookPresent = Wallet.addressBook().length;
  $scope.numberOfActiveAccounts = () => Wallet.accounts().filter(a => !a.archived).length;
  $scope.getLegacyTotal = () => Wallet.total('imported');

  $scope.newAccount = () => {
    Alerts.clear();
    $uibModal.open({
      templateUrl: 'partials/account-form.jade',
      windowClass: 'bc-modal initial',
      controller: 'AccountFormCtrl',
      resolve: {
        account: () => void 0
      }
    });
  };

  $scope.editAccount = (account) => {
    Alerts.clear();
    $uibModal.open({
      templateUrl: 'partials/account-form.jade',
      controller: 'AccountFormCtrl',
      windowClass: 'bc-modal sm',
      resolve: {
        account: () => account
      }
    });
  };

  $scope.revealXpub = (account) => {
    $uibModal.open({
      templateUrl: 'partials/reveal-xpub.jade',
      controller: 'RevealXpubCtrl',
      resolve: {
        account: () => account
      },
      windowClass: 'bc-modal'
    });
  };

  $scope.makeDefault = (account) => {
    Wallet.setDefaultAccount(account);
    Wallet.saveActivity(3);
  };

  $scope.linkWithEmail = (account) => {
    Wallet.exposePaymentData(account);
  };

  $scope.transfer = () => {
    $uibModal.open({
      templateUrl: 'partials/send.jade',
      windowClass: 'bc-modal initial',
      controller: 'SendCtrl',
      resolve: {
        paymentRequest: () => ({
          fromAccount: Wallet.accounts()[Wallet.getDefaultAccountIndex()],
          amount: 0
        }),
        loadBcQrReader: () => {
          return $ocLazyLoad.load('bcQrReader');
        }
      }
    });
  };

  $scope.openTransferAll = () => $uibModal.open({
    templateUrl: 'partials/settings/transfer.jade',
    controller: 'TransferController',
    windowClass: 'bc-modal',
    resolve: { address: () => $scope.activeSpendableAddresses() }
  });

  $scope.archive = (account) => Wallet.archive(account);
  $scope.unarchive = (account) => Wallet.unarchive(account);
  $scope.isDefault = (account) => Wallet.isDefaultAccount(account);
}
