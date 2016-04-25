angular
  .module('walletApp.core')
  .factory('MyWallet', MyWallet);

function MyWallet () {
  return Blockchain.MyWallet;
}
