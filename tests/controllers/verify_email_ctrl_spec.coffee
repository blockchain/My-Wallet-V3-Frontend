describe "VerifyEmailController", ->
  scope = undefined
  $rootScope = undefined
  $controller = undefined

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, $q, _$rootScope_, _$controller_) ->
      $rootScope = _$rootScope_
      $controller = _$controller_

      WalletTokenEndpoints = $injector.get("WalletTokenEndpoints")

      spyOn(WalletTokenEndpoints, "verifyEmail").and.callFake((token) ->
        if token is "token" then $q.resolve() else $q.reject({ error: "error_msg" })
      )

  getControllerScope = (token) ->
    scope = $rootScope.$new()
    $controller "VerifyEmailCtrl",
      $scope: scope,
      $stateParams: {token: token}
    scope

  describe "with token", ->
    beforeEach -> scope = getControllerScope("token")

    it "should call WalletTokenEndpoints.verifyEmail()", inject((WalletTokenEndpoints) ->
      expect(WalletTokenEndpoints.verifyEmail).toHaveBeenCalledWith("token")
    )

    it "should set the state to 'success'", ->
      scope.$digest()
      expect(scope.state).toEqual("success")

  describe "with wrong token", ->
    beforeEach -> scope = getControllerScope("wrong-token")

    it "should set the state to 'error'", ->
      scope.$digest()
      expect(scope.state).toEqual("error")

    it "should set the error value on the scope", ->
      scope.$digest()
      expect(scope.error).toEqual("error_msg")
