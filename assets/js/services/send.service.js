angular
.module('send', [])
.factory('Send', (Wallet, Payment) => {

  const service = {
    templateTransaction: templateTransaction
  };

  return service;

  function templateTransaction() {
    return {
      from: null,
      destinations: [null],
      amounts: [0],
      fee: Wallet.settings.feePerKB,
      customFee: null,
      note: "",
      publicNote: false
    };
  }

});
