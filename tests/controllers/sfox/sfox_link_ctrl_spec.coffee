describe "SfoxLinkController", ->
  scope = undefined
  Wallet = undefined
  $rootScope = undefined
  $controller = undefined
  $q = undefined

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, _$rootScope_, _$controller_, _$q_, _$timeout_) ->
      $rootScope = _$rootScope_
      $controller = _$controller_
      $q = _$q_

      Wallet = $injector.get("Wallet")
      modals = $injector.get("modals")

      $rootScope.installLock = () ->
        scope.locked = false;
        scope.lock = () -> scope.locked = true;
        scope.free = () -> scope.locked = false;

  getControllerScope = (params = {}) ->
    scope = $rootScope.$new()
    scope.vm = 
      exchange:
        getBuyMethods: () -> $q.resolve().then(scope.state.accounts = ['1']).finally(scope.free())
      goTo: (state) ->

    $controller "SfoxLinkController",
      $scope: scope
    scope

  beforeEach ->
    scope = getControllerScope()
    $rootScope.$digest()

  describe "link", ->

    it "should call lock", ->
      spyOn(scope, 'lock');
      scope.link()
      expect(scope.lock).toHaveBeenCalled()

    it "should get possible buy methods", ->
      spyOn(scope.vm.exchange, 'getBuyMethods')
      scope.link()
      expect(scope.vm.exchange.getBuyMethods).toHaveBeenCalled()

    it "should set an account", ->
      scope.link()
      expect(scope.state.accounts).toBeDefined()

    it "should call free", ->
      spyOn(scope, 'free');
      scope.link()
      expect(scope.free).toHaveBeenCalled()      

  describe "verify", ->
    beforeEach ->
      scope.state.accounts = [
        verify: () -> $q.resolve().then(scope.vm.goTo('buy')).finally(scope.free)
      ]

    it "should call lock", ->
      spyOn(scope, 'lock');
      scope.verify()
      expect(scope.lock).toHaveBeenCalled()

    it "should goTo buy", ->
      spyOn(scope.vm, 'goTo')
      scope.verify()
      expect(scope.vm.goTo).toHaveBeenCalled()

    it "should call free", ->
      spyOn(scope, 'free')
      scope.verify()
      scope.$digest()
      expect(scope.free).toHaveBeenCalled()      
