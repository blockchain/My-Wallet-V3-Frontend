describe "CoinifySummaryController", ->
  $q = undefined
  scope = undefined
  Wallet = undefined
  $rootScope = undefined
  $controller = undefined
  buySell = undefined
  Alerts = undefined
  validBuy = true

  mediums =
    'card':
      getAccounts: () -> $q.resolve([])
    'bank':
      getAccounts: () -> $q.resolve([])
  
  quote =
    quoteAmount: 1
    baseAmount: -100
    baseCurrency: 'USD'
    paymentMediums: mediums
    getPaymentMediums: () -> $q.resolve(mediums)
  
  trade =
    state: 'awaiting_transfer_in'
    inCurrency: 'USD'
    outCurrency: 'BTC'
    watchAddress: () -> $q.resolve()

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, _$rootScope_, _$controller_, _$q_, _$timeout_) ->
      $rootScope = _$rootScope_
      $controller = _$controller_
      $q = _$q_

      MyWallet = $injector.get("MyWallet")
      Wallet = $injector.get("Wallet")
      Alerts = $injector.get("Alerts")
      buySell = $injector.get("buySell")
      
      MyWallet.wallet =
        hdwallet:
          defaultAccount: {index: 0}
          accounts: [{label: 'Phil'}]
      
      buySell.limits =
        bank:
          min:
            'EUR': 10
          max:
            'EUR': 1000
        card:
          min:
            'EUR': 10
          max:
            'EUR': 1000
      
      buySell.getExchange = () -> {
        getBuyQuote: () ->
      }
      
      buySell.getQuote = () -> $q.resolve(quote)
      
      buySell.accounts = [
        {
          buy: () -> if validBuy then $q.resolve(trade) else $q.reject({error_description: 'Error'})
        }
      ]

  getControllerScope = (params = {}) ->
    scope = $rootScope.$new()
    scope.vm =
      quote: quote
      medium: 'card'
      baseFiat: () -> true
      watchAddress: () ->
      fiatCurrency: () -> 'USD'
      fiatAmount: () -> -100
      BTCAmount: () -> 1
      goTo: (state) ->

    $controller "CoinifySummaryController",
      $scope: scope,
    scope

  beforeEach ->
    scope = getControllerScope()
    $rootScope.$digest()

  describe ".commitValues()", ->

    it "should disable the form", ->
      spyOn(scope, 'lock')
      scope.commitValues()
      expect(scope.lock).toHaveBeenCalled()
      
    it "should set a new quote", ->
      scope.commitValues()
      scope.$digest()
      expect(scope.vm.quote).toBe(quote)
  
  describe ".openKYC()", ->
    
    it "should get open KYC and go to isx step", ->
      spyOn(buySell, 'getOpenKYC')
      spyOn(scope.vm, 'goTo')
      scope.openKYC()
      scope.$digest()
      expect(buySell.getOpenKYC).toHaveBeenCalled()
      expect(scope.vm.goTo).toHaveBeenCalledWith('isx')

  describe ".buy()", ->
    
    it "should call buy", ->
      spyOn(buySell.accounts[0], 'buy')
      scope.buy()
      expect(buySell.accounts[0].buy).toHaveBeenCalled()
    
    it "should reset the quote and set the trade", ->
      scope.buy()
      scope.$digest()
      expect(scope.vm.quote).toBe(null)
      expect(scope.vm.trade).toBe(trade)
    
    it "should display an error", ->
      spyOn(Alerts, 'displayError')
      validBuy = false
      scope.buy()
      scope.$digest()
      expect(Alerts.displayError).toHaveBeenCalled()
      
