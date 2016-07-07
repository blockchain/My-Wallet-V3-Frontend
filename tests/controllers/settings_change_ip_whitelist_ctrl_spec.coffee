describe "ChangeIpWhitelistCtrl", ->
  scope = undefined
  Wallet = undefined

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller, $compile, $templateCache, $q) ->
      Wallet = $injector.get("Wallet")
      Wallet.settings.ipWhitelist = "1.2.3.4"
      Wallet.setIPWhitelist = () -> $q.resolve()

      scope = $rootScope.$new()
      template = $templateCache.get("partials/settings/change-ip-whitelist.jade")

      $controller "ChangeIpWhitelistCtrl",
        $scope: scope

      scope.model = {}
      $compile(template)(scope)

      scope.status = {}
      scope.errors = {}
      scope.reset()
      scope.$digest()

  it "should have an ipWhitelist field", ->
    expect(scope.fields.ipWhitelist).toBe("1.2.3.4")

  it "should change the whitelist", ->
    spyOn(Wallet, "setIPWhitelist").and.callThrough()
    scope.fields.ipWhitelist = "10.0.0.85"
    scope.setIPWhitelist()
    expect(Wallet.setIPWhitelist).toHaveBeenCalled()

  describe "valid", ->
    valid = [
      '1.1.1.1'
      '1.1.1.1, 1.1.1.2'
      '1.1.1.1,1.1.1.2, '
      '1.%.1.%'
    ]

    for list in valid
      it "should validate #{list}", ->
        scope.fields.ipWhitelist = list
        expect(scope.isWhitelistValid()).toEqual(true)
        expect(scope.errors.ipWhitelist).toBeFalsy()

  describe "invalid", ->
    invalid = [
      '1.',
      '1.1.1.256',
      '%.%.%.%'
      '1..1.256'
    ]

    for list in invalid
      it "should invalidate #{list}", ->
        scope.fields.ipWhitelist = list
        expect(scope.isWhitelistValid()).toEqual(false)
        expect(scope.errors.ipWhitelist).toBeDefined()
