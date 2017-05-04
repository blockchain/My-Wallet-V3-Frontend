angular
  .module('walletApp')
  .component('coinifyCreateAccount', {
    bindings: {
      country: '<',
      viewInfo: '<',
      close: '&',
      onSubmit: '&',
      onSuccess: '&'
    },
    templateUrl: 'partials/coinify/coinify-create-account.pug',
    controller: CoinifyCreateAccount,
    controllerAs: '$ctrl'
  });

function CoinifyCreateAccount ($q, Alerts, $scope, country) {
  this.bank = {
    name: null,
    address: { country: this.country, street: null, city: null, zipcode: null }
  };

  this.profile = {
    name: null,
    address: { country: this.country, street: null, city: null, zipcode: null, state: null }
  };

  this.sepaCountryCodes = country.sepaCountryCodes;
  if (this.country === 'DK' && this.currency === 'DKK') this.showDanish = true;

  const insertSpaces = (str) => {
    let s = str.replace(/[^\dA-Z]/g, ''); // sanitize
    return s.replace(/.{4}/g, (a) => a + ' ');
  };

  this.formatIban = () => {
    let num = this.bankAccount.account.number;
    this.bankAccount.account.number = insertSpaces(num);
  };

  this.turnOffIbanError = () => this.ibanError = false;
  this.switchView = () => this.viewInfo = !this.viewInfo;
  this.selectedBankCountry = this.sepaCountryCodes.find(c => c.code === this.country);
}
