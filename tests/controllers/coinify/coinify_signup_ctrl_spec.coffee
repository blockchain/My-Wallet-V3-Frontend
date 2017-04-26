describe "CoinifySignupController", ->
  $q = undefined
  scope = undefined
  Wallet = undefined
  $rootScope = undefined
  $controller = undefined
  buySell = undefined
  
  profile =
    defaultCurrency: 'EUR'
    currentLimits: {
      bank: {}
      card: {}
    }
  
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

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, _$rootScope_, _$controller_, _$q_, _$timeout_) ->
      $rootScope = _$rootScope_
      $controller = _$controller_
      $q = _$q_

      Wallet = $injector.get("Wallet")
      buySell = $injector.get("buySell")
      
      buySell.getExchange = () -> {
        getBuyQuote: () ->
        exchangeRate:
          get: () -> $q.resolve()
        signup: () -> $q.resolve()
        fetchProfile: () -> $q.resolve(profile)
      }
      
      buySell.getMaxLimits = () ->

  getControllerScope = (params = {}) ->
    scope = $rootScope.$new()
    scope.vm =
      quote: quote
      refreshQuote: () ->
      fiatCurrency: () -> 'USD'
      goTo: (state) ->

    $controller "CoinifySignupController",
      $scope: scope,
    scope

  beforeEach ->
    scope = getControllerScope()
    $rootScope.$digest()

  describe ".signup()", ->

    it "should disable the form", ->
      spyOn(scope, 'lock')
      scope.signup()
      expect(scope.lock).toHaveBeenCalled()
    
    it "should call signup and go to payment medium step", ->
      spyOn(scope.vm, 'goTo')
      scope.signup()
      scope.$digest()
      expect(scope.vm.goTo).toHaveBeenCalledWith('select-payment-medium')
