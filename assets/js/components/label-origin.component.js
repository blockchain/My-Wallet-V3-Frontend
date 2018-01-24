angular
  .module('walletApp')
  .component('labelOrigin', {
    bindings: {
      origin: '<',
      highlight: '<',
      coinCode: '<',
      simple: '<'
    },
    templateUrl: 'templates/label-origin.pug',
    controller: function (Wallet, currency) {
      let display = Wallet.settings.displayCurrency;

      this.coin = this.coinCode || 'btc';
      this.type = currency.isBitCurrency(display) ? this.coin : 'fiat';
    }
  });
