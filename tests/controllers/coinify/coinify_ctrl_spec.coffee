describe "CoinifyController", ->
  $rootScope = undefined
  $controller = undefined
  options = undefined
  buySell = undefined
  $scope = undefined
  Alerts = undefined
  $q = undefined
  
  quote = {
    quoteAmount: 1
    baseAmount: -100
    baseCurrency: 'USD'
    expiresAt: 100000000
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
          coinify: {
            surveyLinks: ['www.blockchain.com/survey']
          }
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
      
      # Alerts.surveyCloseConfirm = () ->
      #   then: (f) -> f(true)

  getController = (quote, trade, options) ->
    scope = $rootScope.$new()
    
    $controller "CoinifyController",
      $scope: scope
      trade: trade || null
      quote: quote || null
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
      
  describe ".expireTrade()", ->
    ctrl = undefined
    beforeEach -> ctrl = getController(quote)
    
    it "should expire the trade", ->
      ctrl.expireTrade()
      $rootScope.$digest()
      expect(ctrl.state.trade.expired).toBe(true)
  
  describe ".timeToExpiration()", ->
    ctrl = undefined
    beforeEach -> ctrl = getController(quote)
    
    it "should return expiration time of quote", ->
      expect(ctrl.timeToExpiration()).toBe(100000000 - ctrl.now())
  
  describe ".refreshQuote()", ->
    ctrl = undefined
    beforeEach -> ctrl = getController(quote)
    
    it "should refresh a quote from fiat", ->
      spyOn(buySell, 'getQuote')
      ctrl.refreshQuote()
      $rootScope.$digest()
      expect(buySell.getQuote).toHaveBeenCalledWith(1, 'USD')
    
    it "should refresh a quote form BTC", ->
      spyOn(buySell, 'getQuote')
      ctrl.quote.baseCurrency = 'BTC'
      ctrl.quote.quoteCurrency = 'USD'
      ctrl.refreshQuote()
      $rootScope.$digest()
      expect(buySell.getQuote).toHaveBeenCalledWith(0.000001, 'BTC', 'USD')
  
  describe ".expireTrade()", ->
    ctrl = undefined
    beforeEach -> ctrl = getController(quote)
    
    it "should set expired trade state", ->
      ctrl.expireTrade()
      $rootScope.$digest()
      expect(ctrl.state.trade.expired).toBe(true)
  
  describe ".goTo()", ->
    ctrl = undefined
    beforeEach -> ctrl = getController()
    
    it "should set the step", ->
      ctrl.goTo('email')
      expect(ctrl.currentStep()).toBe('email')
      
  describe "initial state", ->
    beforeEach -> ctrl = undefined
    
    it "should ask user to verify email", ->
      ctrl = getController()
      expect(ctrl.currentStep()).toBe('email')
    
    it "should ask user to signup if email is verified", inject((Wallet) ->
      Wallet.user.isEmailVerified = true
      ctrl = getController()
      expect(ctrl.currentStep()).toBe('signup')
    )
    
    it "should ask user to select payment medium", inject((Wallet) ->
      Wallet.user.isEmailVerified = true
      buySell.getExchange = () -> { profile: {}, user: 1 }
      ctrl = getController(quote, null)
      expect(ctrl.currentStep()).toBe('select-payment-medium')
    )
    
    it "should ask user to complete isx after a trade is created", inject((Wallet) ->
      Wallet.user.isEmailVerified = true
      buySell.getExchange = () -> { profile: {}, user: 1 }
      ctrl = getController(null, trade)
      expect(ctrl.currentStep()).toBe('isx')
    )
    
    it "should show a completed trade summary", inject((Wallet) ->
      trade =
        state: 'completed'
      Wallet.user.isEmailVerified = true
      buySell.getExchange = () -> { profile: {}, user: 1 }
      ctrl = getController(null, trade)
      expect(ctrl.currentStep()).toBe('trade-complete')
    )
