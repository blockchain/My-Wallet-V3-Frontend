describe "LandingCtrl", ->
  scope = undefined

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller) ->
      scope = $rootScope.$new()

      $controller "LandingCtrl",
        $scope: scope

      return

    return

  describe "signup", ->

    it "should navigate to public.signup", inject(($state) ->
      scope.fields = {email: null}
      spyOn($state, "go")
      scope.signup()
      expect($state.go).toHaveBeenCalled()
    )
