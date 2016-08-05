angular
  .module('walletApp.core')
  .factory('MyBlockchainSettings', MyBlockchainSettings);

function MyBlockchainSettings () {
  return Blockchain.BlockchainSettingsAPI;
}
