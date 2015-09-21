walletStoreServices = angular.module("myWalletPaymentServices", [])
walletStoreServices.factory "MyWalletPayment", ($q) ->
  (shouldReject) ->
    deferred = $q.defer()
    if shouldReject
      deferred.reject('err_message')
    else
      deferred.resolve('tx-hash')

    this.payment = deferred.promise
    this.from = (addr) -> this
    this.to = (dest) -> this
    this.amount = (amount) -> this
    this.fee = (fee) -> this
    this.note = (note) -> this
    this.build = () -> this
    this.sideEffect = () -> this
    this.sign = (pass) -> this
    this.publish = () -> this
    this
