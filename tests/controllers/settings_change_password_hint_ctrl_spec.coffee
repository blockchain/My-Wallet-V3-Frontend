describe "ChangePasswordHintCtrl", ->
  scope = undefined
  Wallet = undefined

  beforeEach angular.mock.module('walletDirectives')

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller, $compile, $templateCache) ->

      scope = $rootScope.$new()
      template = $templateCache.get('partials/settings/change-password-hint.pug')

      $controller "ChangePasswordHintCtrl",
        $scope: scope

      scope.model = {}
      $compile(template)(scope)

      scope.status = {}
      scope.reset()
      scope.$digest()

      return

    return

  it "should have a password hint field", ->
    expect(scope.fields.passwordHint).toBe('')

  it "should change the password hint", inject((Wallet) ->
    spyOn(Wallet, "changePasswordHint")
    scope.fields.passwordHint = "passwordhint"
    scope.changePasswordHint()
    expect(Wallet.changePasswordHint).toHaveBeenCalled()
  )
