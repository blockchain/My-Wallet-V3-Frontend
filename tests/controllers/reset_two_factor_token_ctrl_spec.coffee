describe "ResetTwoFactorTokenController", ->
  scope = undefined

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller) ->
      WalletNetwork = $injector.get("WalletNetwork")
      $state = $injector.get("$state") # This is a mock
      Alerts = $injector.get("Alerts")

      spyOn(WalletNetwork, "resetTwoFactorToken").and.callFake((token)->
        {
          then: (callback) ->
            if token == "token"
              callback({success: true, guid: "1234"})
            {
              catch: (callback) ->
                if token == "wrong-token"
                  callback()
                {
                }
          }
        }
      )

      spyOn($state, "go").and.callThrough()

      spyOn(Alerts, "displayError").and.callFake(() ->)
      spyOn(Alerts, "displayResetTwoFactor").and.callFake(() ->)

      return

    return

  describe "with token", ->
    beforeEach ->
      angular.mock.inject ($controller, $rootScope) ->

        scope = $rootScope.$new()

        $controller "ResetTwoFactorTokenCtrl",
          $scope: scope,
          $stateParams: {token: "token"}

    it "should show call WalletNetwork.resetTwoFactorToken()", inject((WalletNetwork) ->
      expect(WalletNetwork.resetTwoFactorToken).toHaveBeenCalled()
    )

    it "should pass the token parameter along", inject((WalletNetwork) ->
      expect(WalletNetwork.resetTwoFactorToken).toHaveBeenCalledWith("token")
    )

    it "should redirect to the login page", inject(($state)->
      expect($state.go).toHaveBeenCalledWith("public.login-uid", { uid : '1234' })
    )

    it "should request a modal success message", inject((Alerts) ->
      expect(Alerts.displayResetTwoFactor).toHaveBeenCalled()
    )

  describe "with wrong token", ->
    beforeEach ->
      angular.mock.inject ($controller, $rootScope) ->

        scope = $rootScope.$new()

        $controller "ResetTwoFactorTokenCtrl",
          $scope: scope,
          $stateParams: {token: "wrong-token"}

    it "should display an error message", inject((Alerts)->
      expect(Alerts.displayError).toHaveBeenCalled()
    )

    it "should redirect to the login page", inject(($state)->
      expect($state.go).toHaveBeenCalledWith("public.login-no-uid")
    )
