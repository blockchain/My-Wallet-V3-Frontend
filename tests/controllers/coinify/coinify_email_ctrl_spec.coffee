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

      Wallet.changeEmail = () -> $q.resolve()

  getControllerScope = (params = {}) ->
    scope = $rootScope.$new()

    scope.$parent.fields = {
      emailConfirmation: undefined
    }
    
    scope.steps =
      'email': 1

    $controller "CoinifyEmailController",
      $scope: scope,
    scope

  beforeEach ->
    scope = getControllerScope()
    $rootScope.$digest()

  describe "toggleEmail", ->
    it "toggle editEmail", ->
      expect(scope.editEmail).toBe(undefined)
      scope.toggleEmail()
      expect(scope.editEmail).toBe(true)

  describe "verifyEmail", ->
    it "should verify users email", ->
      spyOn(Wallet, "verifyEmail")
      scope.$parent.verifyEmail()
      expect(Wallet.verifyEmail).toHaveBeenCalled()

  describe "changeEmail", ->
    it "should reset rejectedEmail", ->
      scope.changeEmail()
      expect(scope.$parent.rejectedEmail).toBe(undefined)

    it "should change a users email address", ->
      spyOn(Wallet, 'changeEmail')
      scope.changeEmail()
      scope.$digest()
      expect(Wallet.changeEmail).toHaveBeenCalled()
