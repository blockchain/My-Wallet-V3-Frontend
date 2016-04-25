angular
  .module('walletApp.core')
  .factory('MyWalletPayment', MyWalletPayment);

function MyWalletPayment () {
  return Blockchain.Payment;
}
