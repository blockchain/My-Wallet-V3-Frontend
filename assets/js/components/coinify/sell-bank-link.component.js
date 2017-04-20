angular
  .module('walletApp')
  .component('sellBankLink', {
    bindings: {
      transaction: '<',
      accounts: '<',
      selectedBankAccount: '<',
      paymentAccount: '<',
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

  this.banks = this.accounts.accounts;

  $scope.selecting = true;
  $scope.bankLinkEdit = () => $scope.selecting = !$scope.selecting;

  const handleAccountDelete = (account) => {
    let accounts = this.banks;
    for (let i = 0; i < accounts.length; i++) {
      if (accounts[i]['_account']['id'] === account['id']) accounts.splice(i, 1);
    }
    $scope.selecting = false;
    $scope.bankLinkEdit();
    if (this.accounts.length === 0) {
      $scope.hideWhenNoAccounts = true;
    }
  };

  this.deleteAccount = (account) => {
    Alerts.confirm('CONFIRM_DELETE_BANK')
      .then(() => {
        this.paymentAccount.delete(account.id)
        .then(handleAccountDelete(account))
        .catch(e => console.error('Error deleting bank', e));
      });
  };

  this.$onChanges = (changes) => {
    console.log('bank link changes', changes);
    this.selectedBankAccount = changes.selectedBankAccount.currentValue;
  };

  this.isDisabled = () => {
    return !this.selectedBankAccount || !this.banks.length;
  };
}
