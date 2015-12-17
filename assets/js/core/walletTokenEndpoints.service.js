angular
  .module('walletApp.core')
  .factory('MyWalletTokenEndpoints', MyWalletTokenEndpoints);

function MyWalletTokenEndpoints() {
  return Blockchain.WalletTokenEndpoints
}
