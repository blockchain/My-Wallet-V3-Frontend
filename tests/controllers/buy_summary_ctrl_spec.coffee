describe "BuySummaryCtrl", ->
  scope = undefined
  Wallet = undefined
  currency = undefined
  $controller = undefined
  $rootScope = undefined
  buySell = undefined

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, _$rootScope_, _$controller_, _$q_) ->
      $rootScope = _$rootScope_
      $controller = _$controller_
      $q = _$q_

      Wallet = $injector.get("Wallet")
      MyWallet = $injector.get("MyWallet")
      currency = $injector.get("currency")

      Wallet.settings.currency = { code: "USD" }
      Wallet.changeCurrency = () -> $q.resolve()

      MyWallet.wallet = {}
      MyWallet.wallet.accountInfo = {}
      MyWallet.wallet.hdwallet = { accounts: [{ label: 'My Bitcoin Wallet '}] }

      MyWallet.wallet.external =
        coinify:
          getPaymentMethods: ->
          profile: {}

      currency.conversions = { "USD": "$", "EUR": "E", "GBP": "P" }
      buySell = $injector.get("buySell")

      buySell.getExchange = () -> {
        exchangeRate: {
          get: -> $q.resolve({"baseCurrency":"EUR","quoteCurrency":"BTC","rate":0.0019397889509621354})
        } 
        trades: {
          pending: {}
        }
        profile: {
          level: {
            limits: {
              'card': {
                in: 300
              },
              'bank': {
                in: 0
              }
            }
          }
        }
      }

  getControllerScope = (params = {}) ->
    scope = $rootScope.$new()
    scope.transaction = {fiat: 0, btc: 0, fee: 0, total: 0, currency: {symbol: 'E', code: 'EUR'}};
    $controller "BuySummaryCtrl",
      $scope: scope
      exchange: {}
    scope

  # describe "getMaxMin", ->
  #   beforeEach ->
  #     scope = getControllerScope()
  #     scope.method = 'card'

  #   it "should get an exchange rate", ->
  #     spyOn(buySell.getExchange().exchangeRate, 'get')
  #     scope.getMaxMin()
  #     expect(buySell.getExchange().exchangeRate.get).toHaveBeenCalled()

  describe "changeTempCurrency", ->
    beforeEach ->
      scope = getControllerScope()

    it "should only change tempCurrency", ->
      scope.changeTempCurrency({ code: "DKK" })
      expect(scope.transaction.tempCurrency.code).toBe("DKK")

  describe "changeTempAmount", ->
    beforeEach ->
      scope = getControllerScope()
      scope.exchange = {}
      scope.exchange.getBuyQuote = () -> $q.resolve()

    it "should change transaction.fiat with transaction.tempFiat", ->
      scope.transaction.fiat = 20
      scope.transaction.tempFiat = 30
      scope.changeTempAmount()
      expect(scope.transaction.fiat).toBe(30)
