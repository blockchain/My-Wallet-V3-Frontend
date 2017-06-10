angular.module('walletApp.core').factory('MyWalletStore', function () {
  let transactions = [];
  let notes = {};

  let eventListener;

  let password;

  let defaultAccountIndex = 0;

  let isSynchronizedWithServer = true; // In the sense that the server is up to date

  let addressBook = { // The same for everyone
    '17gJCBiPBwY5x43DZMH3UJ7btHZs6oPAGq': 'John',
    '1LJuG6yvRh8zL9DQ2PTYjdNydipbSUQeq': 'Alice'
  };

  let feePerKB = 10000;

  let legacyAddresses = () => [];

  return {
    isSynchronizedWithServer () {
      return isSynchronizedWithServer;
    },

    setIsSynchronizedWithServer (setting) {
      isSynchronizedWithServer = setting;
    },

    sendEvent (event) {
      eventListener(event);
    },

    getFeePerKB () {
      return feePerKB;
    },

    setFeePerKB (fee) {
      feePerKB = fee;
    },

    getMultiAccountSetting () {
      return true;
    },

    getLogoutTime () {
      return 10;
    },

    addEventListener (func) {
      eventListener = func;
    },

    getPbkdf2Iterations () {
      return 10;
    },

    setPbkdf2Iterations () {
    },

    getLanguages () {
      return {de: 'Deutch', en: 'English', nl: 'Nederlands'};
    },

    getCurrencies () {
      return {USD: 'US Dollar', EUR: 'Euro'};
    },

    didUpgradeToHd () {
      return true;
    },

    isMnemonicVerified () {
      return false;
    },

    isCorrectMainPassword (candidate) {
      return candidate === password;
    },

    changePassword (newPassword) {
      password = newPassword;
    },

    getAllTransactions (idx) {
      let res = [];
      for (let transaction of Array.from(transactions)) {
        res.push(transaction);
      }

      return res;
    },

    getAllLegacyAddresses () {
      let res = [];
      for (let key in legacyAddresses) {
        // let value = legacyAddresses[key];
        res.push(key);
      }
      return res;
    },

    getLegacyActiveAddresses () {
      let activeAddresses = [];
      for (let key in legacyAddresses) {
        let value = legacyAddresses[key];
        if (!value.archived) {
          activeAddresses.push(key);
        }
      }
      return activeAddresses;
    },

    getLegacyAddressLabel (address) {
      return legacyAddresses[address].label;
    },

    isWatchOnlyLegacyAddress (address) {
      return legacyAddresses[address].privateKey === null;
    },

    legacyAddressExists (candidate) {
      return (legacyAddresses[candidate] != null);
    },

    getAddressBook () {
      return addressBook;
    },

    getLegacyAddressBalance (address) {
      return legacyAddresses[address].balance;
    },

    getPrivateKey (address) {
      if (Array.from(legacyAddresses).includes(address)) {
        return legacyAddresses[address].privateKey;
      } else {
        return null;
      }
    },

    setLegacyAddressBalance (address, balance) {
      legacyAddresses[address] = balance;
    },

    setLegacyAddressLabel (label) {
    },

    deleteLegacyAddress (address) {
    },

    archiveLegacyAddr (address) {
    },

    unArchiveLegacyAddr (address) {
    },

    getDefaultAccountIndex () {
      return defaultAccountIndex;
    },

    setDefaultAccountIndex (idx) {
      defaultAccountIndex = idx;
    },

    getDoubleEncryption () {
      return false;
    },

    getNote (hash) {
      return notes[hash];
    },

    setNote (hash, text) {
      notes[hash] = text;
      // Circular reference:
      // MyWallet.sync()
    },

    // Mock only:

    mockSetPassword (pwd) {
      password = pwd;
    },

    setNotes (theNotes) {
      notes = theNotes;
    },

    getNotes () {
      return notes;
    },

    setTransactions (theTransactions) {
      transactions = theTransactions;
    },

    appendTransaction (transaction) {
      return transactions.push(transaction);
    },

    addLegacyAddress (address, privateKey, balance, label, archived) {
      legacyAddresses[address] = {privateKey, balance, label, archived};
    },

    setAPICode (api_code) {
    }

  };
});
