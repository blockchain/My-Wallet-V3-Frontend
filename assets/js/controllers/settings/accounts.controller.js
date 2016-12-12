angular
  .module('walletApp')
  .controller('SettingsAccountsController', SettingsAccountsController);

function SettingsAccountsController ($scope, Wallet, Alerts, $uibModal, filterFilter, $ocLazyLoad, modals) {
  $scope.accounts = Wallet.accounts;
  $scope.activeSpendableAddresses = () => Wallet.legacyAddresses().filter(a => a.active && !a.isWatchOnly && a.balance > 0);
  $scope.openTransferAll = () => modals.openTransfer($scope.activeSpendableAddresses());

  $scope.display = {
    archived: false
  };

  $scope.addressBookPresent = Wallet.addressBook().length;
  $scope.numberOfActiveAccounts = () => Wallet.accounts().filter(a => !a.archived).length;
  $scope.isDefault = (account) => Wallet.isDefaultAccount(account);
  $scope.unarchive = (account) => Wallet.unarchive(account);
  $scope.getLegacyTotal = () => Wallet.total('imported');
  $scope.toggleDisplayCurrency = Wallet.toggleDisplayCurrency;

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

  $scope.openVerifyMessage = () => $uibModal.open({
    templateUrl: 'partials/settings/verify-message.jade',
    controller: 'VerifyMessageController',
    windowClass: 'bc-modal initial'
  });
}
