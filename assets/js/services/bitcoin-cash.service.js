angular
  .module('walletApp')
  .factory('BitcoinCash', BitcoinCash);

function BitcoinCash (Wallet) {
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
    }
  };

  return service;
}
