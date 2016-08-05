angular
  .module('walletApp.core')
  .factory('MyWalletStore', MyWalletStore);

function MyWalletStore () {
  return Blockchain.WalletStore;
}
