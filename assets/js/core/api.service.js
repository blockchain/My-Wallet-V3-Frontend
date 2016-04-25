angular
  .module('walletApp.core')
  .factory('MyBlockchainApi', MyBlockchainApi);

function MyBlockchainApi () {
  return Blockchain.API;
}
