describe "CoinifyMediumController", ->
  $q = undefined
  scope = undefined
  Wallet = undefined
  $rootScope = undefined
  $controller = undefined
  buySell = undefined

  mediums =
    'card':
      getAccounts: () -> $q.resolve([])
    'bank':
      getAccounts: () -> $q.resolve([])
  
  quote = {
    quoteAmount: 1
    baseAmount: -100
    baseCurrency: 'USD'
    getPaymentMediums: () -> $q.resolve(mediums)
  }

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, _$rootScope_, _$controller_, _$q_, _$timeout_) ->
      $rootScope = _$rootScope_
      $controller = _$controller_
      $q = _$q_

      Wallet = $injector.get("Wallet")
      buySell = $injector.get("buySell")
      
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

  getControllerScope = (params = {}) ->
    scope = $rootScope.$new()
    scope.vm =
      quote: quote
      medium: 'card'
      baseFiat: () -> true
      fiatCurrency: () -> 'USD',
      goTo: (state) ->

    $controller "CoinifyMediumController",
      $scope: scope,
    scope

  beforeEach ->
    scope = getControllerScope()
    $rootScope.$digest()

  describe ".submit()", ->

    it "should disable the form", ->
      spyOn(scope, 'lock')
      scope.submit()
      expect(scope.lock).toHaveBeenCalled()
    
    it "should getPaymentMediums", ->
      spyOn(quote, 'getPaymentMediums')
      scope.submit()
      expect(quote.getPaymentMediums).toHaveBeenCalled()
    
    it "should go to summary", ->
      spyOn(scope.vm, 'goTo')
      scope.submit()
      scope.$digest()
      expect(scope.vm.goTo).toHaveBeenCalledWith('summary')
