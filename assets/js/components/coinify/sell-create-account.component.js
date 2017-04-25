angular
  .module('walletApp')
  .component('sellCreateAccount', {
    bindings: {
      country: '<',
      sepaCountries: '<',
      txCurrency: '<',
      bankAccount: '<',
      holderCountry: '<',
      selectedBankCountry: '<',
      paymentAccount: '<',
      buildBankHolder: '&',
      selectCountry: '&',
      close: '&',
      onComplete: '&',
      onSuccess: '&'
    },
    templateUrl: 'partials/coinify/sell-create-account.pug',
    controller: CoinifySellCreateAccountController,
    controllerAs: '$ctrl'
  });

function CoinifySellCreateAccountController ($q, buySell, Alerts, $scope) {
  this.holder = { name: null, address: {} };
  this.status = {};

  this.viewInfo = true;

  if (this.country === 'DK' && this.txCurrency === 'DKK') {
    this.showDanish = true;
  }

  this.switchView = () => this.viewInfo = !this.viewInfo;

  const insertSpaces = (str) => {
    let s = str.replace(/[^\dA-Z]/g, ''); // sanitize
    return s.replace(/.{4}/g, (a) => a + ' ');
  };

  this.formatIban = () => {
    let num = this.bankAccount.account.number;
    this.bankAccount.account.number = insertSpaces(num);
  };

  this.turnOffIbanError = () => this.ibanError = false;

  this.isDisabled = () =>

  this.isDisabled = () => {
    if (this.viewInfo) {
      return !this.bankAccount.account.number || !this.bankAccount.account.bic;
    } else {
      return !this.bankAccount.holder.name ||
             !this.bankAccount.holder.address.street ||
             !this.bankAccount.holder.address.zipcode ||
             !this.bankAccount.holder.address.city ||
             !this.selectedBankCountry;
    }
  };

  this.selectedBankCountry = this.sepaCountries.find(c => c.code === this.holderCountry);
  this.bankAccount.holder.address.country = this.selectedBankCountry.code;

  this.$onChanges = (changes) => {
    console.log('holder changes', changes);
  };

  const handleError = (e) => {
    let accountError = JSON.parse(e);
    Alerts.displayError(accountError.error_description);
    $scope.status = {};
    if (accountError.error === 'invalid_iban') {
      this.ibanError = true;
      this.switchView();
    }
  };

  this.createBankAccount = () => {
    this.status.waiting = true;
    if (!this.bankAccount.account.currency || !this.bankAccount.holder.name || !this.bankAccount.bank.address.country) return;
    this.paymentAccount.add(this.bankAccount).then(res => {
      console.log('added bank account', res._account);
      this.onSuccess({bankId: res._account.id});
    })
    .then(this.onComplete)
    .catch(handleError);
    this.status = {};
  };

  console.log('sell account component', this);
}
