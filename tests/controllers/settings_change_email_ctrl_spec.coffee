describe "ChangeEmailCtrl", ->
  scope = undefined
  Wallet = undefined

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller, $compile, $templateCache) ->

      scope = $rootScope.$new()
      template = $templateCache.get('partials/settings/change-email.jade')

      $controller "ChangeEmailCtrl",
        $scope: scope

      scope.model = { fields: {} }
      $compile(template)(scope)

      scope.$digest

      return

    return

  it "should have an email field", ->
    expect(scope.fields.email).toBe('')

  it "should change an email", inject((Wallet) ->
    spyOn(Wallet, "changeEmail")
    scope.fields.email = "steve@jobs.com"
    scope.changeEmail()
    expect(Wallet.changeEmail).toHaveBeenCalled()
  )


