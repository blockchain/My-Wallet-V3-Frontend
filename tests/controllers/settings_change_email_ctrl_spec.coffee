describe "ChangeEmailCtrl", ->
  scope = undefined
  Wallet = undefined

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller, $compile, $templateCache) ->
      Wallet = $injector.get("Wallet")
      MyWallet = $injector.get("MyWallet")

      Wallet.user.email = "a@b.com"
      MyWallet.wallet = {
        external: {}
      }

      scope = $rootScope.$new()
      template = $templateCache.get('partials/settings/change-email.jade')

      $controller "ChangeEmailCtrl",
        $scope: scope

      scope.model = {}
      $compile(template)(scope)

      scope.status = {}
      scope.reset()
      scope.$digest()

      return

    return

  it "should have an email field", ->
    expect(scope.fields.email).toBe("a@b.com")

  it "should change an email", inject((Wallet) ->
    spyOn(Wallet, "changeEmail")
    scope.fields.email = "steve@jobs.com"
    scope.changeEmail()
    expect(Wallet.changeEmail).toHaveBeenCalled()
  )

  describe "isProblemProvider", ->
    it "should detect a reported mail provider", ->
      isProblem = scope.isProblemProvider('user@aol.com')
      expect(isProblem).toEqual(true)

    it "should return false for an ok mail provider", ->
      isProblem = scope.isProblemProvider('user@gmail.com')
      expect(isProblem).toEqual(false)

    it "should return false if passed a non-email", ->
      expect(scope.isProblemProvider()).toEqual(false)
      expect(scope.isProblemProvider(null)).toEqual(false)
      expect(scope.isProblemProvider(false)).toEqual(false)
      expect(scope.isProblemProvider('')).toEqual(false)
