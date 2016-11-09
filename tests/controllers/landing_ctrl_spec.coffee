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

    it "should trust the video src", inject(($sce)->
      spyOn($sce, "trustAsResourceUrl")
      scope.firstLoad()
      expect($sce.trustAsResourceUrl).toHaveBeenCalled()
    )

    it "should use the English video by default", inject(($sce)->
      spyOn($sce, "trustAsResourceUrl")
      scope.firstLoad()
      expect($sce.trustAsResourceUrl.calls.argsFor(0)[0]).toContain('blockchain-ad.mp4')
    )

    it "should use the Chinese video for Chinese users", inject(($sce, languages)->
      spyOn($sce, "trustAsResourceUrl")
      spyOn(languages, "get").and.callFake(() ->
        "zh-cn"
      )

      scope.firstLoad()
      expect($sce.trustAsResourceUrl.calls.argsFor(0)[0]).toContain('zh-cn.mp4')
    )
