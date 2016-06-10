describe "ChangeLogoutTimeCtrl", ->
  scope = undefined
  Wallet = undefined

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller, $compile, $templateCache) ->

      scope = $rootScope.$new()
      template = $templateCache.get('partials/settings/change-logout.jade')

      $controller "ChangeLogoutTimeCtrl",
        $scope: scope

      scope.model = { fields: {} }
      $compile(template)(scope)

      scope.$digest

      return

    return

  it "should have an ipWhitelist field", ->
    expect(scope.fields.logoutTime).toBe('')

  it "should change the whitelist", inject((Wallet) ->
    spyOn(Wallet, "setLogoutTime")
    scope.fields.logoutTime = "100"
    scope.setLogoutTime()
    expect(Wallet.setLogoutTime).toHaveBeenCalled()
  )


