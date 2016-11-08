angular.module('walletApp').controller('LandingCtrl', LandingCtrl);

function LandingCtrl ($scope, $state, $sce, languages) {
  let language_code = languages.get();

  if (language_code === 'zh-cn' || language_code === 'zh_CN') {
    $scope.adUrl = $sce.trustAsResourceUrl('https://storage.googleapis.com/bc_public_assets/video/blockchain-ad-zh-cn.mp4');
  } else {
    $scope.adUrl = $sce.trustAsResourceUrl('https://storage.googleapis.com/bc_public_assets/video/blockchain-ad.mp4');
  }
  $scope.signup = () => {
    $state.go('public.signup', { email: $scope.fields.email });
  };
}
