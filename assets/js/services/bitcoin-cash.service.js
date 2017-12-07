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
      return this.bch.balance;
    },
    get txs () {
      return this.bch.txs;
    },
    get hasSeen () {
      return localStorageService.get('hasSeenBCH');
    },
    get accounts () {
      return this.bch.accounts;
    },
    setHasSeen () {
      localStorageService.set('hasSeenBCH', true);
    }
  };

  return service;
}
