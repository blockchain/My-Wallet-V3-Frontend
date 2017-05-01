describe "CoinifyController", ->
  $rootScope = undefined
  $controller = undefined
  options = undefined
  buySell = undefined
  $scope = undefined
  Alerts = undefined

  quote = {
    quoteAmount: 1
    baseAmount: -100
    baseCurrency: 'USD'
    getPaymentMediums: () -> $q.resolve()
  }

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, $q, _$rootScope_, _$controller_) ->
      $rootScope = _$rootScope_
      $controller = _$controller_
      Wallet = $injector.get("Wallet")
      MyWallet = $injector.get("MyWallet")
      currency = $injector.get("currency")
      buySell = $injector.get("buySell")
      Alerts = $injector.get("Alerts")

      options = {
        partners: {
          coinify: {}
        }
      }

      MyWallet.wallet = {
        hdwallet: {
          defaultAccount: {
            index: 0
          }
          accounts: [{label: ''}]
        }
      }

      buySell: {
        getQuote: (quote) -> $q.resolve(quote)
      }

  getController = (quote, trade) ->
    scope = $rootScope.$new()

    $controller "CoinifyController",
      $scope: scope
      trade: trade || {}
      quote: quote || {}
      options: options || {}
      $uibModalInstance: { close: (->), dismiss: (->) }

  describe ".baseFiat()", ->
    ctrl = undefined
    beforeEach -> ctrl = getController(quote)

    it "should be true if baseCurrency is fiat", ->
      expect(ctrl.baseFiat()).toBe(true)

  describe ".BTCAmount()", ->
    ctrl = undefined
    beforeEach -> ctrl = getController(quote)

    it "should return BTC amount", ->
      expect(ctrl.BTCAmount()).toBe(1)

  describe ".fiatAmount()", ->
    ctrl = undefined
    beforeEach -> ctrl = getController(quote)

    it "should return fiat amount", ->
      expect(ctrl.fiatAmount()).toBe(1)

  describe ".fiatCurrency()", ->
    ctrl = undefined
    beforeEach -> ctrl = getController(quote)

    it "should return fiat currency", ->
      expect(ctrl.fiatCurrency()).toBe('USD')

  describe ".goTo()", ->
    ctrl = undefined
    beforeEach -> ctrl = getController()

    it "should set the step", ->
      ctrl.goTo('email')
      expect(ctrl.currentStep()).toBe('email')
