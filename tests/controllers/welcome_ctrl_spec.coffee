describe "WelcomeCtrl", ->
  scope = undefined

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller) ->
      scope = $rootScope.$new()

      $controller "WelcomeCtrl",
        $scope: scope

      return

    return

  it "should scroll", ->
    document.getElementById = () -> {}
    spyOn(scope, 'scrollTo').and.callThrough()
    spyOn(scope, 'easeInOut').and.callThrough()
    scope.scroll()
    expect(scope.scrollTo).toHaveBeenCalled()
    expect(scope.easeInOut).toHaveBeenCalled()

  describe "signup", ->

    it "should navigate to public.signup", inject(($state) ->
      spyOn($state, "go")
      scope.signup()
      expect($state.go).toHaveBeenCalled()
    )
