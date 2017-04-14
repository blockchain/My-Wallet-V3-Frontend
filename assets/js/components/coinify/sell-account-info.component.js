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

  this.turnOffIbanError = () => this.ibanError = false;

  this.isDisabled = () => !this.bankAccount.account.number || !this.bankAccount.account.bic;
}
