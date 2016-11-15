angular.module('walletApp').controller('LandingCtrl', LandingCtrl);

function LandingCtrl ($scope, $state, $sce, languages) {
  $scope.fields = {
    email: undefined
  };

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
    $state.go('public.signup', { email: $scope.fields.email });
  };
}
