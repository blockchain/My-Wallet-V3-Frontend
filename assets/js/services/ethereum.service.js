angular
  .module('walletApp')
  .factory('Ethereum', Ethereum);

function Ethereum ($q, Wallet, MyBlockchainApi) {
  const service = {
    get eth () {
      return Wallet.my.wallet.eth;
    },
    get balance () {
      return this.eth.balance;
    },
    get defaultAccount () {
      return this.eth.defaultAccount;
    },
    get defaults () {
      return this.eth.defaults;
    },
    get ethInititalized () {
      return this.eth && this.defaultAccount && true;
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

  return service;
}
