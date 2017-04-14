angular
  .module('walletApp')
  .component('sellAccountInfo', {
    bindings: {
      country: '<',
      ibanError: '<',
      buildBankAccount: '&'
    },
    templateUrl: 'partials/coinify/account-info.pug',
    controller: CoinifySellAccountInfoController,
    controllerAs: '$ctrl'
  });

function CoinifySellAccountInfoController (buySell, Alerts, $scope) {
  console.log('sell account info component', this);

  if (this.country === 'DK') {
    this.showDanish = true;
  }

  this.sendBankNums = (data) => {
    this.buildBankAccount(data);
  };

  this.turnOffIbanError = () => this.ibanError = false;

  this.selectCountry = (type, country) => {
    this.selectedBankCountry = country;
    if (type === 'bank') {
      this.setAccountType();
      this.bankAccount.bank.address.country = country.code;
      this.country = country.name;
    } else if (type === 'holder') {
      this.bankAccount.holder.address.country = country.code;
    }
  };

}
