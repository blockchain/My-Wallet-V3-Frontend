angular
  .module('walletApp.core')
  .factory('MyWalletHelpers', MyWalletHelpers);

function MyWalletHelpers () {
  return Blockchain.Helpers;
}
