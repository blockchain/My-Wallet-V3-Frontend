angular
  .module('walletApp')
  .component('coinifyCreateAccount', {
    bindings: {
      country: '<',
      viewInfo: '<',
      error: '<',
      close: '&',
      onSubmit: '&',
      onSuccess: '&'
    },
    templateUrl: 'partials/coinify/coinify-create-account.pug',
    controller: CoinifyCreateAccount,
    controllerAs: '$ctrl'
  });

function CoinifyCreateAccount ($q, Alerts, $scope, country) {
  this.sepaCountryCodes = country.sepaCountryCodes;
  if (this.country === 'DK') this.showDanish = true;
  this.selectedUserCountry = this.sepaCountryCodes.find(c => c.code === this.country);

  this.bank = {
    account: { number: null, bic: null, currency: null },
    bank: { address: { country: this.country, street: null, city: null, zipcode: null } }
  };

  this.profile = {
    name: null,
    address: { country: this.country, street: null, city: null, zipcode: null, state: null }
  };

  const insertSpaces = (str) => {
    let s = str.replace(/[^\dA-Z]/g, '');
    return s.replace(/.{4}/g, (a) => a + ' ');
  };

  this.formatIban = () => {
    let num = this.bank.account.number;
    this.bank.account.number = insertSpaces(num);
  };

  this.$onChanges = (changes) => {
    if (changes.error.currentValue === true) {
      this.ibanError = true;
      this.switchView();
    }
  };

  this.turnOffIbanError = () => this.ibanError = false;
  this.switchView = () => this.viewInfo = !this.viewInfo;
  this.setUserCountry = (country) => this.profile.address.country = country.code;
}
