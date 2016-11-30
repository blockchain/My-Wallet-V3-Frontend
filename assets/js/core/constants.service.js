angular
  .module('walletApp.core')
  .factory('BlockchainConstants', BlockchainConstants);

function BlockchainConstants () {
  return Blockchain.constants;
}
