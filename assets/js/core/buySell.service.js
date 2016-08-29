angular
  .module('walletApp.core')
  .factory('MyWalletBuySell', MyWalletBuySell);

function MyWalletBuySell () {
  return Blockchain.BuySell;
}
