angular
  .module('walletApp.core')
  .factory('MyWalletNetwork', MyWalletNetwork);

function MyWalletNetwork() {
  return Blockchain.WalletNetwork
}
