describe "ChangeIpWhitelistCtrl", ->
  scope = undefined
  Wallet = undefined

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller, $compile, $templateCache) ->

      scope = $rootScope.$new()
      template = $templateCache.get('partials/settings/change-ip-whitelist.jade')

      $controller "ChangeIpWhitelistCtrl",
        $scope: scope

      scope.model = { fields: {} }
      $compile(template)(scope)

      scope.$digest

      return

    return

  it "should have an ipWhitelist field", ->
    expect(scope.fields.ipWhitelist).toBe('')

  it "should change the whitelist", inject((Wallet) ->
    spyOn(Wallet, "setIPWhitelist")
    scope.fields.ipWhitelist = "10.0.0.85"
    scope.setIPWhitelist()
    expect(Wallet.setIPWhitelist).toHaveBeenCalled()
  )


