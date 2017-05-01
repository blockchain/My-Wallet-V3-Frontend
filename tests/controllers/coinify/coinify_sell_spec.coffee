# fdescribe "CoinifySellController", ->
#   $rootScope = undefined
#   $controller = undefined
#   options = undefined
#   buySell = undefined
#   buySellOptions = undefined
#   $scope = undefined
#   accounts = undefined
#   masterPaymentAccount = undefined
#   payment = undefined
#   trade = undefined
#   exchange = undefined
#
#   quote = {
#     quoteAmount: 1
#     baseAmount: -100
#     baseCurrency: 'EUR'
#     getPayoutMediums: () -> $q.resolve()
#   }
#
#   beforeEach angular.mock.module("walletApp")
#
#   beforeEach ->
#     angular.mock.inject ($injector, $q, _$rootScope_, _$controller_) ->
#       $rootScope = _$rootScope_
#       $controller = _$controller_
#       Wallet = $injector.get("Wallet")
#       MyWallet = $injector.get("MyWallet")
#       currency = $injector.get("currency")
#       buySell = $injector.get("buySell")
#
#       options = {
#         partners: {
#           coinify: {}
#         }
#       }
#
#       buySellOptions = {
#         isSweepTransaction: false
#       }
#
#       exchange = {
#         profile: {
#           email: 'user@gmail.com',
#           country: 'FR'
#         }
#       }
#       accounts = []
#       masterPaymentAccount = {}
#       payment = {}
#       trade = {
#         quote: {
#           quoteCurrency: 'EUR'
#         }
#       }
#
#       MyWallet.wallet = {
#         hdwallet: {
#           defaultAccount: {
#             index: 0
#           }
#           accounts: [{label: ''}]
#         }
#       }
#
#       buySell: {
#         getQuote: (quote) -> $q.resolve(quote)
#       }
#
#   getController = (quote, trade, exchange) ->
#     scope = $rootScope.$new()
#
#     $controller "CoinifySellController",
#       $scope: scope
#       trade: trade || {}
#       quote: quote || {}
#       options: options || {}
#       buySellOptions: buySellOptions || {}
#       accounts: accounts || []
#       masterPaymentAccount: masterPaymentAccount || {}
#       payment: payment || {}
#       exchange: exchange || {}
#       $uibModalInstance: { close: (->), dismiss: (->) }
#
#   describe ".selectAccount()", ->
#     beforeEach ->
#       ctrl = getController(quote, trade)
#
#     it "should set the bank account", ->
#       ctrl = getController(quote, trade)
