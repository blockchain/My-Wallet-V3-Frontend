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

function CoinifySellBankLinkController (Alerts) {
  if (!this.accounts.length) this.hideWhenNoAccounts = true;
  this.selecting = true;
  this.bankLinkEdit = () => this.selecting = !this.selecting;

  this.handleAccountDelete = (bankAccount) => {
    for (let i = 0; i < this.accounts.length; i++) {
      if (this.accounts[i]['_id'] === bankAccount['_id']) this.accounts.splice(i, 1);
    }
    this.selecting = false;
    this.bankLinkEdit();
    if (this.accounts.length === 0) {
      this.hideWhenNoAccounts = true;
    }
  };

  this.deleteAccount = (bankAccount) => {
    Alerts.confirm('CONFIRM_DELETE_BANK')
      .then(() => {
        bankAccount.delete()
        .then(this.handleAccountDelete(bankAccount))
        .catch(e => console.error('Error deleting bank', e));
      });
  };

  this.$onChanges = (changes) => {
    if (changes.selectedBankAccount) {
      this.selectedBankAccount = changes.selectedBankAccount.currentValue;
    }
  };
  this.isDisabled = () => !this.selectedBankAccount || !this.accounts.length || !this.selecting;
}
