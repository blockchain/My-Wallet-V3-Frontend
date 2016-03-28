angular
  .module('walletApp')
  .controller('ResetTwoFactorCtrl', ResetTwoFactorCtrl);

function ResetTwoFactorCtrl ($scope, $rootScope, $http, $translate, WalletNetwork, Alerts, $sce) {
  $scope.currentStep = 1;
  $scope.fields = {
    email: '',
    newEmail: '',
    secret: '',
    message: '',
    captcha: ''
  };

  $rootScope.loginFormUID.then((res) => {
    $scope.fields.uid = res;
  });

  $scope.refreshCaptcha = () => {
    WalletNetwork.getCaptchaImage().then((data) => {
      let url = URL.createObjectURL(data.image);
      $sce.trustAsResourceUrl(url);
      $scope.captchaSrc = url;
      $scope.sessionToken = data.sessionToken;
      $scope.fields.captcha = '';
      $rootScope.$safeApply();
    });
  };

  $scope.resetTwoFactor = () => {
    $scope.working = true;
    let success = (message) => {
      Alerts.clear();
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
      $scope.sessionToken,
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
