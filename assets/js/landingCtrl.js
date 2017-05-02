angular.module('walletApp').controller('LandingCtrl', LandingCtrl);

function LandingCtrl ($scope, $state, $sce, languages, Env, $timeout, $q, $window) {
  Env.then(env => {
    $scope.rootURL = env.rootURL;

    $scope.track = (state) => {
      let url = `${env.walletHelperUrl}/wallet-helper/google/#/analytics/${env.googleAnalyticsKey}/${state}`;
      $scope.googleAnalyticsUrl = $sce.trustAsResourceUrl(url);

      let defer = $q.defer();

      let receiveMessage = (e) => {
        if (!e.data.command) return;
        if (e.data.from !== 'google') return;
        if (e.data.to !== 'wallet') return;
        if (e.origin !== env.walletHelperUrl) return;
        if (['done'].indexOf(e.data.command) < 0) return;

        if (e.data.command === 'done') {
          defer.resolve();
        }
      };
      $window.addEventListener('message', receiveMessage, false);

      return defer.promise;
    };

    $scope.trackAndGo = (state, stateParams) => {
      let timeout;

      let cancelTimeout = () => {
        $timeout.cancel(timeout);
      };

      let go = () => {
        $state.go(state, stateParams);
      };

      $scope.track(state).then(cancelTimeout).then(go);

      // Don't wait more than 300 ms for Google Analytics
      timeout = $timeout(() => {
        console.info('Failed to update Google Analytics');
        go();
      }, 300);
    };

    $scope.track('landing');
  });

  $scope.fields = {
    email: undefined
  };

  $scope.languages = languages.languages;

  $scope.firstLoad = () => {
    let language_code = languages.get();

    let suffix;

    if (language_code === 'zh-cn' || language_code === 'zh_CN') {
      suffix = '-zh-cn';
    } else if (language_code === 'ru') {
      suffix = '-ru';
    } else if (language_code === 'uk') {
      suffix = '-ru';
    } else {
      suffix = '';
    }

    $scope.adUrl = $sce.trustAsResourceUrl(`https://storage.googleapis.com/bc_public_assets/video/blockchain-ad${ suffix }.mp4`);
  };

  $scope.firstLoad();

  $scope.signup = () => {
    if ($scope.fields.email) {
      $scope.trackAndGo('public.signup', { email: $scope.fields.email });
    } else {
      $scope.trackAndGo('public.signup');
    }
  };

  $scope.login = () => {
    $scope.trackAndGo('public.login-no-uid');
  };

  $scope.$watch(languages.get, (code) => {
    $scope.language = languages.mapCodeToName(code);
    $scope.searchUrl = code === 'en' ? '/search' : `/${code}/search`;
  });
}
