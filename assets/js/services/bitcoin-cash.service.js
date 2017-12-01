angular
  .module('walletApp')
  .factory('BitcoinCash', BitcoinCash);

function BitcoinCash (Wallet, localStorageService) {
  const service = {
    lastTxHash: null,
    get bch () {
      return Wallet.my.wallet.bch;
    },
    get balance () {
      return this.bch.balance / 1e8;
    },
    get txs () {
      return this.bch.txs;
    },
    get hasSeen () {
      return localStorageService.get('hasSeenBCH');
    },
    setHasSeen () {
      localStorageService.set('hasSeenBCH', true);
    }
  };

  return service;
}
