angular
  .module('walletApp.core')
  .factory('MyWalletMetadata', MyWalletMetadata);

function MyWalletMetadata () {
  return Blockchain.Metadata;
}
