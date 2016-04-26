angular
  .module('walletApp.core')
  .factory('WalletNetwork', WalletNetwork);

function WalletNetwork () {
  return Blockchain.WalletNetwork;
}
