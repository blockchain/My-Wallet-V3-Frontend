angular
  .module('walletApp')
  .component('sellBankLink', {
    bindings: {
      accounts: '<',
      selectedBankAccount: '<',
      paymentAccount: '<',
      transaction: '<',
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
  this.title = 'SELL.LINKED_ACCOUNTS';
  if (!this.accounts.length) this.hideWhenNoAccounts = true;
  this.selecting = true;
  this.bankLinkEdit = () => this.selecting = !this.selecting;

  this.handleAccountDelete = (account) => {
    for (let i = 0; i < this.accounts.length; i++) {
      if (this.accounts[i]['id'] === account['id']) this.accounts.splice(i, 1);
    }
    this.selecting = false;
    this.bankLinkEdit();
    if (this.accounts.length === 0) {
      this.hideWhenNoAccounts = true;
    }
  };

  this.deleteAccount = (account) => {
    Alerts.confirm('CONFIRM_DELETE_BANK')
      .then(() => {
        this.paymentAccount.delete(account.id)
        .then(this.handleAccountDelete(account))
        .catch(e => console.error('Error deleting bank', e));
      });
  };

  this.$onChanges = (changes) => this.selectedBankAccount = changes.selectedBankAccount.currentValue;
  this.isDisabled = () => !this.selectedBankAccount || !this.accounts.length || !this.selecting;
}
