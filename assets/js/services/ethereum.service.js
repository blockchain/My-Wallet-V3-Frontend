angular
  .module('walletApp')
  .factory('Ethereum', Ethereum);

function Ethereum ($q, Wallet, MyBlockchainApi, MyWalletHelpers, Env) {
  const service = {
    lastTxHash: null,
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
    get isInWhitelistedCountry () {
      return this.countries === '*' || this.countries.indexOf(Wallet.my.wallet.accountInfo.countryCodeGuess) > -1;
    },
    get isInRolloutGroup () {
      return MyWalletHelpers.isStringHashInFraction(Wallet.my.wallet.guid, this.rolloutFraction);
    },
    get userHasAccess () {
      if (Wallet.my.wallet == null) return false;
      return this.ethInititalized || (this.isInWhitelistedCountry && this.isInRolloutGroup);
    },
    get userAccessReason () {
      let reason;
      if (Wallet.my.wallet == null) reason = 'wallet is null';
      else if (this.ethInititalized) reason = 'it is already initialized';
      else if (this.isInWhitelistedCountry && this.isInRolloutGroup) reason = 'they are in a whitelisted country and in the rollout group';
      else if (this.isInWhitelistedCountry) reason = 'they are in a whitelisted country but not in the rollout group';
      else if (this.isInRolloutGroup) reason = 'they are in the rollout group but not in a whitelisted country';
      else reason = 'they are not in a whitelisted country or the rollout group';
      return `User can${this.userHasAccess ? '' : 'not'} see Ethereum because ${reason}`;
    },
    get hasSeen () {
      return this.eth.hasSeen;
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
    return MyWalletHelpers.isEtherAddress(address);
  };

  service.getPrivateKeyForAccount = (account, secPass) => {
    return service.eth.getPrivateKeyForAccount(account, secPass);
  };

  service.recordLastTransaction = (hash) => {
    service.lastTxHash = hash;
  };

  service.setHasSeen = () => {
    service.eth.setHasSeen(true);
  };

  service.isWaitingOnTransaction = () => {
    return (
      service.lastTxHash != null &&
      service.defaultAccount.txs.find(tx => tx.hash === service.lastTxHash) == null
    );
  };

  service.fetchFees = () => {
    return $q.resolve(service.eth.fetchFees());
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
