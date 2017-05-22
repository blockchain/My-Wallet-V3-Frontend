angular.module('walletApp').factory('Labels', () =>
  ({
    addLabel () { return Promise.resolve(); },
    getLabel (accountIdx, receiveIdx) {
      if (receiveIdx === 1) {
        return 'Hello';
      } else {
        return null;
      }
    },
    all (accountIdx) {
      return [
        null,
        { label: 'pending' },
        {label: 'labelled_address', used: true},
        {label: null, used: true}
      ];
    },
    checkIfUsed (accountIdx) {
      return Promise.resolve();
    },
    removeLabel () {
      return Promise.resolve();
    },
    fetchBalance (addresses) { return Promise.resolve(); }
  })
);
