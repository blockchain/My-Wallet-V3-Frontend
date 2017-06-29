angular
  .module('walletApp')
  .factory('Ethereum', Ethereum);

function Ethereum (Wallet) {
  return Wallet.my.wallet.eth;
}
