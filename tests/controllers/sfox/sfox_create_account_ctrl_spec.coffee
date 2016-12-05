describe "SfoxCreateAccountController", ->
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

      Wallet.user =
        email: 'sn@blockchain.com'
        mobileNumber: '123-456-7891'

      Wallet.changeEmail = () -> $q.resolve()
      Wallet.verifyEmail = () -> $q.resolve()
      Wallet.changeMobile = () -> $q.resolve()
      Wallet.verifyMobile = () -> $q.resolve()

  getControllerScope = (params = {}) ->
    scope = $rootScope.$new()
    scope.vm = {exchange: 'SFOX'}
    $controller "SfoxCreateAccountController",
      $scope: scope
    scope

  beforeEach ->
    scope = getControllerScope()
    $rootScope.$digest()

  describe "state", ->

    it "should set 'terms' to false", ->
      expect(scope.state.terms).toBe(false)

    describe "lock and free", ->

      it "should toggle the busy state", ->
        scope.lock()
        expect(scope.locked).toBe(true)
        scope.free()
        expect(scope.locked).toBe(false)

  describe "setState", ->

    it "should match the user's preferences", ->
      expect(scope.state.email).toBe('sn@blockchain.com')
      expect(scope.state.mobile).toBe('123-456-7891')
      expect(scope.state.isEmailVerified).toBe(undefined)
      expect(scope.state.isMobileVerified).toBe(undefined)

  describe "changeEmail", ->

    it "should call lock", ->
      spyOn(scope, 'lock')
      scope.changeEmail()
      expect(scope.lock).toHaveBeenCalled()

    it "should change the users email address", ->
      spyOn(Wallet, 'changeEmail')
      scope.changeEmail()
      expect(Wallet.changeEmail).toHaveBeenCalled()

  describe "changeMobile", ->

    it "should change the mobile number", ->
      spyOn(Wallet, 'changeMobile')
      scope.changeMobile()
      expect(Wallet.changeMobile).toHaveBeenCalled()

  describe "verifyMobile", ->

    it "should verify the mobile number", ->
      spyOn(Wallet, 'verifyMobile')
      scope.verifyMobile()
      expect(Wallet.verifyMobile).toHaveBeenCalled()
