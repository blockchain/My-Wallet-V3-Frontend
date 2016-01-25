describe "AuthorizeApproveController", ->
  scope = undefined

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller) ->
      WalletTokenEndpoints = $injector.get("WalletTokenEndpoints")
      $state = $injector.get("$state") # This is a mock
      Alerts = $injector.get("Alerts")

      spyOn(WalletTokenEndpoints, "authorizeApprove").and.callThrough()

      spyOn($state, "go").and.callThrough()

      spyOn(Alerts, "displayError").and.callFake(() ->)
      spyOn(Alerts, "displaySuccess").and.callFake(() ->)

      return

    return

  describe "with token", ->
    beforeEach ->
      angular.mock.inject ($controller, $rootScope) ->

        scope = $rootScope.$new()

        $controller "AuthorizeApproveCtrl",
          $scope: scope,
          $stateParams: {token: "token"}

    it "should show call WalletTokenEndpoints.authorizeApprove()", inject((WalletTokenEndpoints) ->
      expect(WalletTokenEndpoints.authorizeApprove).toHaveBeenCalled()
    )

    it "should pass the token parameter along", inject((WalletTokenEndpoints) ->
      expect(WalletTokenEndpoints.authorizeApprove.calls.argsFor(0)[0]).toEqual("token")
    )

    it "should show success", inject(($state)->
      expect(scope.success).toBeTruthy()
    )

  describe "with other browser", ->
    beforeEach ->
      angular.mock.inject ($controller, $rootScope) ->

        scope = $rootScope.$new()

        $controller "AuthorizeApproveCtrl",
          $scope: scope,
          $stateParams: {token: "token-other-browser"}

    it "should not redirect", inject(($state) ->
      expect($state.go).not.toHaveBeenCalled()
    )

  describe "with wrong token", ->
    beforeEach ->
      angular.mock.inject ($controller, $rootScope) ->

        scope = $rootScope.$new()

        $controller "AuthorizeApproveCtrl",
          $scope: scope,
          $stateParams: {token: "wrong-token"}

    it "should display an error message", inject((Alerts)->
      expect(Alerts.displayError).toHaveBeenCalled()
    )

    it "should redirect to the login page", inject(($state)->
      expect($state.go).toHaveBeenCalledWith("public.login-no-uid")
    )
