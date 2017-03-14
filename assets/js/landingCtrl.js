angular.module('walletApp').controller('LandingCtrl', LandingCtrl);

function LandingCtrl ($scope, $state, $sce, $http, languages) {
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
    $state.go('public.signup', { email: $scope.fields.email });
  };

  $scope.$watch(languages.get, (code) => {
    $scope.language = languages.mapCodeToName(code);
    $scope.searchUrl = code === 'en' ? '/search' : `/${code}/search`;
  });

  let setNWallets = (res) => {
    let nWallets = res.data.values[res.data.values.length - 1]['y'];
    $scope.nWallets = Math.floor(nWallets / 1000000);
  };

  $http.get('https://api.blockchain.info/charts/my-wallet-n-users?format=json').then(setNWallets);
}
