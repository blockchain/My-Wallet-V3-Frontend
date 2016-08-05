angular
  .module('walletApp.core')
  .factory('WalletTokenEndpoints', WalletTokenEndpoints);

function WalletTokenEndpoints () {
  return Blockchain.WalletTokenEndpoints;
}
