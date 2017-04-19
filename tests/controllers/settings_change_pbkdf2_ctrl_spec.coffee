describe "ChangePbkdf2Ctrl", ->
  scope = undefined
  Wallet = undefined
  $timeout = undefined

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller, $compile, $templateCache) ->
      $timeout = $injector.get("$timeout")
      Wallet = $injector.get("Wallet")
      Wallet.settings.pbkdf2 = 10

      scope = $rootScope.$new()
      template = $templateCache.get('partials/settings/change-pbkdf2.pug')

      $controller "ChangePbkdf2Ctrl",
        $scope: scope

      scope.model = {}
      $compile(template)(scope)

      scope.status = {}
      scope.reset()
      scope.$digest()

  it "should have a pbkdf2 field", ->
    expect(scope.fields.pbkdf2).toBe(10)

  it "should change the pbkdf2 iterations", inject((Wallet) ->
    spyOn(Wallet, "setPbkdf2Iterations")
    scope.fields.pbkdf2 = 100
    scope.setPbkdf2()
    expect(Wallet.setPbkdf2Iterations).toHaveBeenCalled()
  )

  it "should stop waiting if operation was cancelled", ->
    spyOn(Wallet, "setPbkdf2Iterations").and.callFake((n, s, e, cancel) -> $timeout(-> cancel()))
    scope.setPbkdf2()
    expect(scope.status.waiting).toEqual(true)
    $timeout.flush()
    expect(scope.status.waiting).toEqual(false)
