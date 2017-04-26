describe "CoinifyISXController", ->
  scope = undefined
  $rootScope = undefined
  $controller = undefined
  
  trade =
    medium: 'bank'
    inCurrency: 'USD'
    outCurrency: 'BTC'
    state: 'processing'

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, _$rootScope_, _$controller_, _$q_, _$timeout_) ->
      $rootScope = _$rootScope_
      $controller = _$controller_

  getControllerScope = (params = {}) ->
    scope = $rootScope.$new()
    scope.vm =
      trade: trade
      goTo: (state) ->

    $controller "CoinifyISXController",
      $scope: scope,
    scope

  beforeEach ->
    scope = getControllerScope()
    $rootScope.$digest()

  describe "state", ->

    it "should have a trade", ->
      expect(scope.vm.trade).toBeDefined()
