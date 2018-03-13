angular
  .module('walletApp')
  .component('labelOrigin', {
    bindings: {
      origin: '<',
      highlight: '<',
      coinCode: '<',
      simple: '<',
      truncateDisplay: '<'
    },
    templateUrl: 'templates/label-origin.pug',
    controller: function (Wallet, currency) {
      let display = Wallet.settings.displayCurrency;

      this.coin = this.coinCode || 'btc';
      this.type = currency.isBitCurrency(display) ? this.coin : 'fiat';

      if (this.origin && this.truncateDisplay) {
        this.displayValue = this.origin.label || this.origin.address;

        if (this.displayValue.length > 22) {
          this.displayValue = this.displayValue.substring(0, 22) + '...';
        }
      }
    }
  });
