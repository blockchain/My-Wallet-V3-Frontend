describe "ChangeLogoutTimeCtrl", ->
  scope = undefined
  Wallet = undefined

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller, $compile, $templateCache) ->
      Wallet = $injector.get("Wallet")
      Wallet.settings.logoutTimeMinutes = 10

      scope = $rootScope.$new()
      template = $templateCache.get('partials/settings/change-logout.pug')

      $controller "ChangeLogoutTimeCtrl",
        $scope: scope

      scope.model = {}
      $compile(template)(scope)

      scope.status = {}
      scope.reset()
      scope.$digest()

  it "should have an ipWhitelist field", ->
    expect(scope.fields.logoutTime).toBe(10)

  it "should change the whitelist", inject((Wallet) ->
    spyOn(Wallet, "setLogoutTime")
    scope.fields.logoutTime = 100
    scope.setLogoutTime()
    expect(Wallet.setLogoutTime).toHaveBeenCalled()
  )
