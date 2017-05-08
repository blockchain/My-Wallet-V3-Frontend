describe('LandingCtrl', () => {
  let scope;

  beforeEach(angular.mock.module('walletApp'));

  beforeEach(function () {
    angular.mock.inject(function ($injector, $rootScope, $controller) {
      scope = $rootScope.$new();

      $controller("LandingCtrl",
        {$scope: scope});

    });

  });

  describe('signup', () => {

    it("should navigate to public.signup", inject(function ($state) {
      scope.fields = {email: null};
      spyOn($state, "go");
      scope.signup();
      expect($state.go).toHaveBeenCalled();
    })
    );

    it("should trust the video src", inject(function ($sce){
      spyOn($sce, "trustAsResourceUrl");
      scope.firstLoad();
      expect($sce.trustAsResourceUrl).toHaveBeenCalled();
    })
    );

    it("should use the English video by default", inject(function ($sce){
      spyOn($sce, "trustAsResourceUrl");
      scope.firstLoad();
      expect($sce.trustAsResourceUrl.calls.argsFor(0)[0]).toContain('blockchain-ad.mp4');
    })
    );

    it("should use the Chinese video for Chinese users", inject(function ($sce, languages){
      spyOn($sce, "trustAsResourceUrl");
      spyOn(languages, "get").and.callFake(() => "zh-cn");

      scope.firstLoad();
      expect($sce.trustAsResourceUrl.calls.argsFor(0)[0]).toContain('zh-cn.mp4');
    })
    );

    it("should use the Russian video for Russian and Ukrainian users", inject(function ($sce, languages){
      spyOn($sce, "trustAsResourceUrl");

      languages.get = () => "ru";
      scope.firstLoad();
      expect($sce.trustAsResourceUrl.calls.argsFor(0)[0]).toContain('-ru.mp4');

      languages.get = () => "uk";
      scope.firstLoad();
      expect($sce.trustAsResourceUrl.calls.argsFor(1)[0]).toContain('-ru.mp4');
    })
    );
  });
});
