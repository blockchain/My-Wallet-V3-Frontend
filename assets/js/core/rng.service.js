angular
  .module('walletApp.core')
  .factory('MyBlockchainRng', MyBlockchainRng);

function MyBlockchainRng () {
  return Blockchain.RNG;
}
