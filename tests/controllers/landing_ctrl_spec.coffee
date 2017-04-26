describe "LandingCtrl", ->
  scope = undefined

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller, $q) ->
      scope = $rootScope.$new()

      $controller "LandingCtrl",
        $scope: scope
        Env: $q.resolve({
          googleAnalyticsKey: "analytics_key",
          walletHelperUrl: "https://wallet-helper/"
        })

      scope.$digest()

      return

    return

  describe "signup", ->

    it "should navigate to public.signup", inject(() ->
      scope.fields = {email: null}
      spyOn(scope, "trackAndGo")
      scope.signup()
      expect(scope.trackAndGo).toHaveBeenCalledWith('public.signup')
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

    it "should use the Russian video for Russian and Ukrainian users", inject(($sce, languages)->
      spyOn($sce, "trustAsResourceUrl")

      languages.get = () -> "ru"
      scope.firstLoad()
      expect($sce.trustAsResourceUrl.calls.argsFor(0)[0]).toContain('-ru.mp4')

      languages.get = () -> "uk"
      scope.firstLoad()
      expect($sce.trustAsResourceUrl.calls.argsFor(1)[0]).toContain('-ru.mp4')
    )

  describe "login", ->
    it "should navigate to public.login-no-uid", inject(() ->
      spyOn(scope, "trackAndGo")
      scope.login()
      expect(scope.trackAndGo).toHaveBeenCalledWith('public.login-no-uid')
    )

  describe "track", ->
    it "should set googleAnalyticsUrl", inject(($sce)->
      scope.track('test')
      expect($sce.valueOf(scope.googleAnalyticsUrl)).toEqual(
        'https://wallet-helper//wallet-helper/google/#/analytics/analytics_key/test'
      )
    )
