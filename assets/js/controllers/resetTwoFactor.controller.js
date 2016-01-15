angular
  .module('walletApp')
  .controller('ResetTwoFactorCtrl', ResetTwoFactorCtrl);

function ResetTwoFactorCtrl($scope, $rootScope, $http, $translate, WalletNetwork, Alerts) {

  $scope.currentStep = 1;
  $scope.fields = {
    uid: $rootScope.loginFormUID,
    email: '',
    newEmail: '',
    secret: '',
    message: '',
    captcha: ''
  };

  $scope.refreshCaptcha = () => {
    let time = new Date().getTime();
    $scope.captchaSrc = $rootScope.rootURL + `kaptcha.jpg?timestamp=${time}`;
    $scope.fields.captcha = '';
  };

  $scope.resetTwoFactor = () => {
    $scope.working = true;
    let success = (res) => {
      $scope.working = false;
      $scope.currentStep = 2;
    };
    let error = (e) => {
      $scope.working = false;
      $scope.refreshCaptcha();
    };

    $scope.form.$setPristine();
    $scope.form.$setUntouched();

    WalletNetwork.requestTwoFactorReset(
      $scope.fields.uid,
      $scope.fields.email,
      $scope.fields.newEmail,
      $scope.fields.secret,
      $scope.fields.message,
      $scope.fields.captcha,
    ).then(success).catch(error);
  };

  // Set SID cookie by requesting headers
  $http({
    url: $rootScope.rootURL + 'wallet/login',
    method: 'HEAD',
    withCredentials: true
  }).then($scope.refreshCaptcha);
}
