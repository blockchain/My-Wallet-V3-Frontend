describe "CoinifyEmailController", ->
  scope = undefined
  Wallet = undefined
  $rootScope = undefined
  $controller = undefined

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, _$rootScope_, _$controller_, _$q_, _$timeout_) ->
      $rootScope = _$rootScope_
      $controller = _$controller_
      $q = _$q_

      Wallet = $injector.get("Wallet")

  getControllerScope = (params = {}) ->
    scope = $rootScope.$new()

    scope.$parent.exchange = {
      trades: []
    }

    $controller "CoinifyMediumController",
      $scope: scope,
    scope

  beforeEach ->
    scope = getControllerScope()
    scope.exchange = {}
    $rootScope.$digest()

  describe "showNote()", ->

    it "should show card notes if no card trades exist", ->
      scope.$parent.medium = 'card';

      expect(scope.showNote('card')).toBe(true);
