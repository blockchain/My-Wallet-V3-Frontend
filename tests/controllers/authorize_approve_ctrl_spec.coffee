describe "AuthorizeApproveController", ->
  scope = undefined

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller) ->
      MyWalletTokenEndpoints = $injector.get("MyWalletTokenEndpoints")
      $state = $injector.get("$state") # This is a mock
      Alerts = $injector.get("Alerts")

      spyOn(MyWalletTokenEndpoints, "authorizeApprove").and.callThrough()

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

    it "should show call MyWalletTokenEndpoints.authorizeApprove()", inject((MyWalletTokenEndpoints) ->
      expect(MyWalletTokenEndpoints.authorizeApprove).toHaveBeenCalled()
    )

    it "should pass the token parameter along", inject((MyWalletTokenEndpoints) ->
      expect(MyWalletTokenEndpoints.authorizeApprove.calls.argsFor(0)[0]).toEqual("token")
    )

    it "should redirect to the login page", inject(($state)->
      expect($state.go).toHaveBeenCalledWith("public.login-uid", { uid : '1234' })
    )

    it "should display a success message", inject((Alerts) ->
      expect(Alerts.displaySuccess).toHaveBeenCalled()
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
