
import {
  MyWallet,
  Payment,
  RNG,
  API,
  Helpers,
  Metadata,
  BuySell,
  BlockchainSettingsAPI,
  WalletStore,
  WalletNetwork,
  WalletTokenEndpoints
} from 'blockchain-wallet-client';

export default angular.module('walletApp.core', [])
  .factory('MyWallet', () => MyWallet)
  .factory('MyWalletPayment', () => Payment)
  .factory('MyBlockchainRng', () => RNG)
  .factory('MyBlockchainApi', () => API)
  .factory('MyWalletHelpers', () => Helpers)
  .factory('MyWalletMetadata', () => Metadata)
  .factory('MyWalletBuySell', () => BuySell)
  .factory('MyBlockchainSettings', () => BlockchainSettingsAPI)
  .factory('MyWalletStore', () => WalletStore)
  .factory('WalletNetwork', () => WalletNetwork)
  .factory('WalletTokenEndpoints', () => WalletTokenEndpoints)
  .name;
