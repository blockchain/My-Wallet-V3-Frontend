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
    let success = (message) => {
      Alerts.clear()
      Alerts.displaySuccess(message);

      $scope.working = false;
      $scope.currentStep = 2;
      $rootScope.$safeApply();
    };
    let error = (error) => {
      $scope.working = false;
      $scope.refreshCaptcha();

      switch (error) {
        case 'Captcha Code Incorrect':
          Alerts.displayError('CAPTCHA_INCORRECT', true);
          break;
        case 'Quota Exceeded':
          Alerts.displayError('QUOTA_EXCEEDED', true);
          break;
        default:
          Alerts.displayError(error, true);
      }

      $rootScope.$safeApply();
    };

    $scope.form.$setPristine();
    $scope.form.$setUntouched();

    WalletNetwork.requestTwoFactorReset(
      $scope.fields.uid,
      $scope.fields.email,
      $scope.fields.newEmail,
      $scope.fields.secret,
      $scope.fields.message,
      $scope.fields.captcha
    ).then(success).catch(error);
  };

  $scope.refreshCaptcha();
}
