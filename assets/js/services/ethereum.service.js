angular
  .module('walletApp')
  .factory('Ethereum', Ethereum);

function Ethereum (MyWallet) {
  const service = {
    get eth () {
      return MyWallet.wallet.eth;
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
    return this.eth.getTxNote(hash);
  };

  service.setTxNote = (hash, note) => {
    return this.eth.setTxNote(hash, note);
  };

  service.fetchHistory = () => {
    return this.eth.fetchHistory();
  };

  service.isContractAddress = (address) => {
    return this.eth.isContractAddress(address);
  };

  service.isAddress = (address) => {
    return this.eth.isAddress(address);
  };

  return service;
}
