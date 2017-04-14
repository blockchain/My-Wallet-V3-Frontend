angular
  .module('walletApp')
  .component('sellAccountHolder', {
    bindings: {
      country: '<',
      sepaCountries: '<',
      bankAccount: '<',
      holderCountry: '<',
      selectedBankCountry: '<',
      buildBankHolder: '&',
      selectCountry: '&',
      close: '&',
      onComplete: '&',
      onSuccess: '&',
      setIbanError: '&'
    },
    templateUrl: 'partials/coinify/account-holder.pug',
    controller: CoinifySellAccountHolderController,
    controllerAs: '$ctrl'
  });

function CoinifySellAccountHolderController ($q, buySell, Alerts, $scope) {
  this.holder = { name: null, address: {} };
  this.status = {};

  this.isDisabled = () => !this.bankAccount.holder.name ||
                          !this.bankAccount.holder.address.street ||
                          !this.bankAccount.holder.address.zipcode ||
                          !this.bankAccount.holder.address.city ||
                          !this.bankAccount.holder.address.country;

  this.selectedBankCountry = this.sepaCountries.find(c => c.code === this.holderCountry);

  this.$onChanges = (changes) => {
    console.log('holder changes', changes);
  };

  const handleError = (e) => {
    console.log('error', e);
    let accountError = JSON.parse(e);
    Alerts.displayError(accountError.error_description);
    $scope.status = {};
    if (accountError.error === 'invalid_iban') {
      this.setIbanError();
    }
  };

  this.createBankAccount = () => {
    this.status.waiting = true;
    if (!this.bankAccount.account.currency || !this.bankAccount.holder.name || !this.bankAccount.bank.address.country) return;
    console.log('createBankAccount', this.bankAccount);
    $q.resolve(buySell.createBankAccount(this.bankAccount))
      .then(result => {
        console.log('result', result);
        this.onSuccess({bankId: result.id});
      })
      .then(() => this.onComplete())
      .catch(e => handleError(e));
      // .then(data => handleAfterAccountCreate(data))
    this.status = {};
  };

  console.log('sell account holder component', this);
}
