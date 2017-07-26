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
      if (Wallet.my.wallet == null || this.eth == null) return false;
      return this.ethInititalized || (
        (this.countries === '*' || this.countries.indexOf(Wallet.my.wallet.accountInfo.countryCodeGuess) > -1) &&
        MyWalletHelpers.isStringHashInFraction(Wallet.my.wallet.guid, this.rolloutFraction)
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

  service.initialize = () => {
    if (!service.eth.defaultAccount) {
      return Wallet.askForSecondPasswordIfNeeded().then(secPass => {
        service.eth.createAccount(void 0, secPass);
        service.fetchHistory();
      }, () => {
        return $q.reject('ETHER_SECPASS_REQUIRED');
      });
    } else {
      return $q.resolve();
    }
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
