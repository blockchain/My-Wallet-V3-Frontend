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
    // let btcBalance = Wallet.total();
    // let btcTxs = Wallet.my.wallet.txList.transactions().length;
    //
    // let ethInititalized = service.eth && service.defaultAccount && true;
    // let ethBalance = ethInititalized ? parseFloat(service.defaultAccount.balance) : 0;
    // let ethTxs = ethInititalized ? service.defaultAccount.txs.length : 0;
    //
    // console.log(JSON.stringify({ btcBalance, ethBalance, btcTxs, ethTxs }));
    // MyBlockchainApi.btcEthUsageStats(btcBalance, ethBalance, btcTxs, ethTxs);
  };

  return service;
}
