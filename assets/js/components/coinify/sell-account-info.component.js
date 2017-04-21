angular
  .module('walletApp')
  .component('sellAccountInfo', {
    bindings: {
      country: '<',
      ibanError: '<',
      bankAccount: '<',
      buildBankAccount: '&',
      close: '&',
      onComplete: '&'
    },
    templateUrl: 'partials/coinify/account-info.pug',
    controller: CoinifySellAccountInfoController,
    controllerAs: '$ctrl'
  });

function CoinifySellAccountInfoController (buySell, Alerts, $scope) {
  console.log('sell account info component', this);

  this.account = {};

  if (this.country === 'DK') {
    this.showDanish = true;
  }

  const insertSpaces = (str) => {
    let s = str.replace(/[^\dA-Z]/g, ''); // sanitize
    return s.replace(/.{4}/g, (a) => a + ' ');
  };

  this.formatIban = () => {
    let num = this.bankAccount.account.number;
    this.bankAccount.account.number = insertSpaces(num);
  };

  this.turnOffIbanError = () => this.ibanError = false;

  this.isDisabled = () => !this.bankAccount.account.number || !this.bankAccount.account.bic;
}
