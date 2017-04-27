angular
  .module('walletApp')
  .component('sellModalHeader', {
    bindings: {
      title: '<',
      transaction: '<',
      hide: '<'
    },
    templateUrl: 'partials/coinify/sell-modal-header.pug',
    controller: CoinifySellModalHeaderController,
    controllerAs: '$ctrl'
  });

function CoinifySellModalHeaderController () {
}
