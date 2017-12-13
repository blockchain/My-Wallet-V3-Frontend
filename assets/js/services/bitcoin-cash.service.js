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
      return this.bch && this.bch.balance;
    },
    get txs () {
      return this.bch && this.bch.txs;
    },
    get hasSeen () {
      return this.bch.hasSeen;
    },
    get accounts () {
      return this.bch && this.bch.accounts;
    },
    setHasSeen () {
      this.bch.setHasSeen(true);
    }
  };

  return service;
}
