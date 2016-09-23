angular
  .module('walletApp')
  .controller('ResetTwoFactorCtrl', ResetTwoFactorCtrl);

function ResetTwoFactorCtrl ($scope, $cookies, $q, $sce, Alerts, Wallet, WalletNetwork) {
  $scope.currentStep = 1;

  $scope.fields = {
    email: '',
    newEmail: '',
    secret: '',
    message: '',
    captcha: ''
  };

  $scope.fields.uid = $cookies.get('uid');

  $scope.refreshCaptcha = () => $q.resolve(
    WalletNetwork.getCaptchaImage().then((data) => {
      let url = URL.createObjectURL(data.image);
      $sce.trustAsResourceUrl(url);
      $scope.captchaSrc = url;
      $scope.sessionToken = data.sessionToken;
      $scope.fields.captcha = '';
    })
  );

  $scope.resetTwoFactor = () => {
    $scope.working = true;

    let success = (message) => {
      Alerts.clear();
      Alerts.displaySuccess(message);
      $scope.working = false;
      $scope.currentStep = 2;
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
    };

    $scope.form.$setPristine();
    $scope.form.$setUntouched();

    let resetP =
      WalletNetwork.requestTwoFactorReset(
        $scope.sessionToken,
        $scope.fields.uid,
        $scope.fields.email,
        $scope.fields.newEmail,
        $scope.fields.secret,
        $scope.fields.message,
        $scope.fields.captcha
      );

    $q.resolve(resetP).then(success, error);
  };

  $scope.refreshCaptcha();
}
