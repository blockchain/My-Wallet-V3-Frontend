angular
  .module('walletApp')
  .factory('BitcoinCash', BitcoinCash);

function BitcoinCash ($q, Wallet, localStorageService) {
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
    },
    getHistory () {
      return this.bch.getHistory();
    },
    initialize (_secPass) {
      let wallet = Wallet.my.wallet;
      let needsSecPass = _secPass == null && wallet.isDoubleEncrypted;

      let initializeWithSecPass = () => (
        Wallet.askForSecondPasswordIfNeeded().then(
          (secPass) => service.initialize(secPass),
          () => $q.reject('NEED_SECOND_PASSWORD_FOR_UPGRADE'))
      );

      if (!wallet.isMetadataReady) {
        if (needsSecPass) return initializeWithSecPass();
        return Wallet.prepareMetadata(_secPass)
          .then(() => service.initialize(_secPass));
      }

      return $q.resolve();
    }
  };

  return service;
}
