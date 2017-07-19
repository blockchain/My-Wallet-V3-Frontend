angular
  .module('walletApp')
  .factory('Ethereum', Ethereum);

function Ethereum ($q, Wallet) {
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

  service.initialize = () => {
    if (!service.eth.defaultAccount) {
      return Wallet.askForSecondPasswordIfNeeded().then(secPass => {
        service.eth.createAccount(void 0, secPass);
      });
    } else {
      return $q.resolve();
    }
  };

  return service;
}
