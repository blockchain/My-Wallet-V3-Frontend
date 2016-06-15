describe "ChangePbkdf2Ctrl", ->
  scope = undefined
  Wallet = undefined

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller, $compile, $templateCache) ->

      scope = $rootScope.$new()
      template = $templateCache.get('partials/settings/change-pbkdf2.jade')

      $controller "ChangePbkdf2Ctrl",
        $scope: scope

      scope.model = { fields: {} }
      $compile(template)(scope)

      scope.$digest

      return

    return

  it "should have a password hint field", ->
    expect(scope.fields.pbkdf2).toBe('')

  it "should change the password hint", inject((Wallet) ->
    spyOn(Wallet, "setPbkdf2Iterations")
    scope.fields.pbkdf2 = "100"
    scope.setPbkdf2()
    expect(Wallet.setPbkdf2Iterations).toHaveBeenCalled()
  )


