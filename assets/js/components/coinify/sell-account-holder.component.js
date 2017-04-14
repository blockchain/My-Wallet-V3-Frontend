angular
  .module('walletApp')
  .component('sellAccountHolder', {
    bindings: {
      country: '<',
      ibanError: '<',
      buildBankAccount: '&',
      close: '&',
      onComplete: '&'
    },
    templateUrl: 'partials/coinify/account-holder.pug',
    controller: CoinifySellAccountHolderController,
    controllerAs: '$ctrl'
  });

function CoinifySellAccountHolderController (buySell, Alerts, $scope) {
  console.log('sell account holder component', this);

  this.holder = { name: null, address: {} };

  this.isDisabled = () => !this.holder.name || !this.holder.address.street || !this.holder.address.zipcode || !this.holder.address.city || !this.holder.address.country;
}
