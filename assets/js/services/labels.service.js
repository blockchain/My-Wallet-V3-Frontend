angular
  .module('walletApp')
  .factory('Labels', Labels);

Labels.$inject = ['MyWallet'];

function Labels (MyWallet) {
  return MyWallet.wallet.labels;
}
