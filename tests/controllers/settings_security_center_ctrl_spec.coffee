describe "SettingsSecurityCenterCtrl", ->
  scope = undefined
  Wallet = undefined

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller) ->
      Wallet = $injector.get("Wallet")

      Wallet.user = {
        internationalMobileNumber: "+1234567890"
      }

      scope = $rootScope.$new()

      $controller "SettingsSecurityCenterCtrl",
        $scope: scope,
        $stateParams: {},

      scope.$digest()

      return

    return

  it "should have wallet settings", inject((Wallet) ->
    expect(scope.settings).toBe(Wallet.settings)
  )

  it "should have wallet user", inject((Wallet) ->
    expect(scope.user).toBe(Wallet.user)
  )

  it "should have wallet status", inject((Wallet) ->
    expect(scope.status).toBe(Wallet.status)
  )

  it "should toggle the current display", ->
    scope.display.action = 'email'
    scope.toggle(scope.display.action)
    expect(scope.display.action).toBe(null)

  it "should display the email field if editting", ->
    scope.beginEditEmail()
    expect(scope.display.editingEmail).toBeTruthy()

  it "should close the email editor field but not the display", ->
    scope.cancelEditEmail()
    expect(scope.display.editingEmail).toBeFalsy()
    expect(scope.display.action).toBeTruthy()

  it "should close the password hint field", ->
    scope.cancelEditPasswordHint()
    expect(scope.display.action).toBe(null)