angular
  .module('walletApp')
  .controller('LostGuidCtrl', LostGuidCtrl);

function LostGuidCtrl ($scope, AngularHelper, $http, $translate, WalletNetwork, Alerts, $sce, Wallet) {
  $scope.currentStep = 1;
  $scope.fields = {
    email: '',
    captcha: ''
  };

  $scope.refreshCaptcha = () => {
    WalletNetwork.getCaptchaImage().then((data) => {
      let url = URL.createObjectURL(data.image);
      $sce.trustAsResourceUrl(url);
      $scope.captchaSrc = url;
      $scope.sessionToken = data.sessionToken;
      $scope.fields.captcha = '';
      AngularHelper.$safeApply();
    });
  };

  $scope.sendReminder = () => {
    $scope.working = true;
    let success = (message) => {
      $scope.working = false;
      $scope.currentStep = 2;
      Alerts.displaySuccess('EMAIL_SENT');
      AngularHelper.$safeApply();
    };

    let error = (error) => {
      $scope.working = false;

      switch (error) {
        case 'Captcha Code Incorrect':
          Alerts.displayError('CAPTCHA_INCORRECT');
          break;
        case 'Quota Exceeded':
          Alerts.displayError('QUOTA_EXCEEDED');
          break;
        default:
          Alerts.displayError('UNKNOWN_ERROR');
      }

      $scope.refreshCaptcha();
      AngularHelper.$safeApply();
    };

    $scope.form.$setPristine();
    $scope.form.$setUntouched();

    WalletNetwork.recoverGuid($scope.sessionToken, $scope.fields.email, $scope.fields.captcha).then(success).catch(error);
  };

  $scope.refreshCaptcha();
}
