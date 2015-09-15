walletSpenderServices = angular.module('myWalletPaymentServices', [])
walletSpenderServices.factory 'Payment', () ->
  Blockchain.Payment
