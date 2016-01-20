angular
  .module('walletApp')
  .controller('LostGuidCtrl', LostGuidCtrl);

function LostGuidCtrl($scope, $rootScope, $http, $translate, WalletNetwork, Alerts) {
  $scope.currentStep = 1;
  $scope.fields = {
    email: '',
    captcha: ''
  };

  $scope.refreshCaptcha = () => {
    let time = new Date().getTime();
    $scope.captchaSrc = $rootScope.rootURL + `kaptcha.jpg?timestamp=${time}`;
    $scope.fields.captcha = '';
  };

  $scope.sendReminder = () => {
    $scope.working = true;
    let success = (res) => {
      $scope.working = false;
      $scope.currentStep = 2;
    };
    let error = (res) => {
      $scope.working = false;
      $scope.refreshCaptcha();
    };

    $scope.form.$setPristine();
    $scope.form.$setUntouched();

    WalletNetwork.recoverGuid($scope.fields.email, $scope.fields.captcha).then(success).catch(error);
  };

  // Set SID cookie by requesting headers
  $http({
    url: $rootScope.rootURL + 'wallet/login',
    method: 'HEAD',
    withCredentials: true
  }).then(() => {
    $scope.refreshCaptcha();
  });
}
