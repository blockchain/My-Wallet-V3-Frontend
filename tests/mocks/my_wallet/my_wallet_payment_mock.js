angular.module('walletApp.core').factory('MyWalletPayment', $q =>
  function (w, p, shouldReject, rejectWith) {
    let tx = {
      txid: 'tx-hash'
    };

    let deferred = $q.defer();
    if (shouldReject) {
      deferred.reject(rejectWith || 'err_message');
    } else {
      deferred.resolve(tx);
    }

    this.payment = deferred.promise;
    this.from = function (addr) { return this; };
    this.to = function (dest) { return this; };
    this.amount = function (amount) { return this; };
    this.fee = function (fee) { return this; };
    this.feePerKb = function (feePerKb) { return this; };
    this.note = function (note) { return this; };
    this.useAll = function () { return this; };
    this.build = function () { return this; };
    this.then = function (cb) { cb({ transaction: 'tx' }); return this; };
    this.catch = function () { return this; };
    this.sideEffect = function () { return this; };
    this.sign = function (pass) { return this; };
    this.publish = function () { return this; };
    this.on = function (e, f) {
      if (e === 'update') {
        this.triggerUpdate = f;
      }
      return this;
    };
    return this;
  }
);
