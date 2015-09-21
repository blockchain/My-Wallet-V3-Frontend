walletPaymentServices = angular.module("myWalletPaymentServices", [])
walletPaymentServices.factory "MyWalletPayment", () ->
  Blockchain.Payment
