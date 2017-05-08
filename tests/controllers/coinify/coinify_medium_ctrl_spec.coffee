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
    baseAmount: -30000
    baseCurrency: 'USD'
    getPaymentMediums: () -> $q.resolve(mediums)
  }
  
  kyc = {
    id: 111,
    state: 'pending'
    createdAt: new Date()
  }

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, _$rootScope_, _$controller_, _$q_, _$timeout_) ->
      $rootScope = _$rootScope_
      $controller = _$controller_
      $q = _$q_

      Wallet = $injector.get("Wallet")
      buySell = $injector.get("buySell")
      
      buySell.kycs = [kyc]
      
      buySell.limits =
        bank:
          min:
            'EUR': 300
          max:
            'EUR': 1000
          yearlyMax:
            'EUR': 299
        card:
          min:
            'EUR': 10
          max:
            'EUR': 300

  getControllerScope = (params = {}) ->
    scope = $rootScope.$new()
    scope.vm =
      quote: quote
      medium: 'card'
      baseFiat: () -> true
      fiatCurrency: () -> 'EUR',
      goTo: (state) ->

    $controller "CoinifyMediumController",
      $scope: scope,
    scope

  beforeEach ->
    scope = getControllerScope()
    $rootScope.$digest()

  describe ".belowCardMax()", ->
    
    it "should be true if amount is less than or equal to card max", ->
      expect(scope.belowCardMax).toBe(true)
  
  describe ".aboveBankMin()", ->
    
    it "should be true if amount is greater than or equal to bank min", ->
      expect(scope.aboveBankMin).toBe(true)
  
  # describe ".needsKYC()", ->
  #   
  #   it "should return true if amount is greater than yearlyMax", ->
  #     expect(scope.needsKYC('bank')).toBe(true)
  # 
  
  describe ".pendingKYC()", ->
    
    it "should return true if the user has a kyc pending", ->
      expect(scope.pendingKYC()).toBe(true)
  
  describe ".openKYC()", ->
    
    it "should get open KYC and go to isx step", ->
      spyOn(buySell, 'getOpenKYC')
      spyOn(scope.vm, 'goTo')
      scope.openKYC()
      scope.$digest()
      expect(buySell.getOpenKYC).toHaveBeenCalled()
      expect(scope.vm.goTo).toHaveBeenCalledWith('isx')
      
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
