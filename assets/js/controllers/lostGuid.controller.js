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
    let success = (message) => {
      $scope.working = false;
      $scope.currentStep = 2;
      Alerts.displaySuccess(message);
      $rootScope.$safeApply();

    };
    let error = (error) => {
      $scope.working = false;

      switch (error) {
        case 'Captcha Code Incorrect':
          Alerts.displayError($translate.instant('CAPTCHA_INCORRECT'));
          break;
        case 'Quota Exceeded':
          Alerts.displayError($translate.instant('QUOTA_EXCEEDED'));
          break;
        default:
          Alerts.displayError($translate.instant('UNKNOWN_ERROR'));
      }

      $scope.refreshCaptcha();
      $rootScope.$safeApply();
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
