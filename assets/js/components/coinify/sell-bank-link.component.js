angular
  .module('walletApp')
  .component('sellBankLink', {
    bindings: {
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
  this.banks = this.accounts;
  if (!this.banks.length) this.hideWhenNoAccounts = true;
  this.selecting = true;
  this.bankLinkEdit = () => this.selecting = !this.selecting;

  const handleAccountDelete = (account) => {
    let accounts = this.banks;
    for (let i = 0; i < accounts.length; i++) {
      if (accounts[i]['_account']['id'] === account['id']) accounts.splice(i, 1);
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
        .then(handleAccountDelete(account))
        .catch(e => console.error('Error deleting bank', e));
      });
  };

  this.$onChanges = (changes) => this.selectedBankAccount = changes.selectedBankAccount.currentValue;
  this.isDisabled = () => !this.selectedBankAccount || !this.banks.length || !this.selecting;
}
