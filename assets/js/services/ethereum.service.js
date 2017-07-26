angular
  .module('walletApp')
  .factory('Ethereum', Ethereum);

function Ethereum ($q, Wallet, MyBlockchainApi, MyWalletHelpers, Env) {
  const service = {
    get eth () {
      return Wallet.my.wallet.eth;
    },
    get balance () {
      return this.ethInititalized ? this.eth.getApproximateBalance(8) : null;
    },
    get defaultAccount () {
      return this.ethInititalized ? this.eth.defaultAccount : null;
    },
    get defaults () {
      return this.eth.defaults;
    },
    get ethInititalized () {
      return Wallet.my.wallet && this.eth && this.eth.defaultAccount && true;
    },
    countries: [],
    rolloutFraction: 0,
    get userHasAccess () {
      let wallet = Wallet.my.wallet;
      if (wallet == null) return false;
      return this.ethInititalized || (
        (this.countries === '*' || this.countries.indexOf(wallet.accountInfo.countryCodeGuess) > -1) &&
        MyWalletHelpers.isStringHashInFraction(wallet.guid, this.rolloutFraction)
      );
    }
  };

  service.getTxNote = (hash) => {
    return service.eth.getTxNote(hash);
  };

  service.setTxNote = (hash, note) => {
    return service.eth.setTxNote(hash, note);
  };

  service.fetchHistory = () => {
    return service.eth.fetchHistory();
  };

  service.isContractAddress = (address) => {
    return service.eth.isContractAddress(address);
  };

  service.isAddress = (address) => {
    return service.eth.isAddress(address);
  };

  service.getPrivateKeyForAccount = (account, secPass) => {
    return service.eth.getPrivateKeyForAccount(account, secPass);
  };

  service.initialize = (_secPass) => {
    let wallet = Wallet.my.wallet;
    let needsSecPass = _secPass == null && wallet.isDoubleEncrypted;

    let initializeWithSecPass = () => (
      Wallet.askForSecondPasswordIfNeeded().then(
        (secPass) => service.initialize(secPass),
        () => $q.reject('ETHER_SECPASS_REQUIRED'))
    );

    if (!wallet.isMetadataReady) {
      if (needsSecPass) return initializeWithSecPass();
      return wallet.cacheMetadataKey(_secPass)
        .then(() => wallet.loadMetadata())
        .then(() => service.initialize(_secPass));
    }

    if (!service.eth.defaultAccount) {
      if (needsSecPass) return initializeWithSecPass();
      service.eth.createAccount(void 0, _secPass);
      return service.fetchHistory();
    }

    return $q.resolve();
  };

  service.recordStats = () => {
    let btcBalance = Wallet.total();
    let ethBalance = service.ethInititalized ? parseFloat(service.defaultAccount.balance) : 0;
    console.log(JSON.stringify({ btcBalance, ethBalance }));
    MyBlockchainApi.incrementBtcEthUsageStats(btcBalance, ethBalance);
  };

  Env.then((options) => {
    let { ethereum } = options;
    if (ethereum && !isNaN(ethereum.rolloutFraction)) {
      service.countries = ethereum.countries || [];
      service.rolloutFraction = ethereum.rolloutFraction;
    }
  });

  return service;
}
