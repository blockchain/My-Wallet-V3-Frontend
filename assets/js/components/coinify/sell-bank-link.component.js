angular
  .module('walletApp')
  .component('sellBankLink', {
    bindings: {
      transaction: '<',
      accounts: '<',
      selectedBankAccount: '<',
      onComplete: '&',
      newAccount: '&',
      close: '&',
      selectAccount: '&'
    },
    templateUrl: 'partials/coinify/bank-link.pug',
    controller: CoinifySellBankLinkController,
    controllerAs: '$ctrl'
  });

function CoinifySellBankLinkController (buySell, Alerts, $scope, $q) {
  console.log('sell bank link component', this);

  $scope.selecting = true;
  $scope.bankLinkEdit = () => $scope.selecting = !$scope.selecting;

  const handleAccountDelete = (account) => {
    let accounts = this.accounts;
    for (let i = 0; i < accounts.length; i++) {
      if (accounts[i]['id'] === account['id']) accounts.splice(i, 1);
    }
    console.log('accounts', accounts);
    $scope.selecting = false;
    $q.resolve(buySell.getBankAccounts());
    $scope.bankLinkEdit();
    if (accounts.length === 0) {
      $scope.hideWhenNoAccounts = true;
    }
  };

  this.deleteAccount = (account) => {
    Alerts.confirm('CONFIRM_DELETE_BANK')
      .then(() => {
        $q.resolve(buySell.deleteBankAccount(account.id))
          .catch(e => console.error('Error deleting bank', e))
          .finally(handleAccountDelete(account));
      });
  };

  this.$onChanges = (changes) => {
    console.log('changes', changes);
  };

  this.isDisabled = () => {
    return !this.selectedBankAccount;
  };
}
