angular
  .module('walletApp')
  .controller('LostGuidCtrl', LostGuidCtrl);

function LostGuidCtrl ($scope, $rootScope, $http, $translate, WalletNetwork, Alerts) {
  let service;
  WalletNetwork.then((res) => {
    service = res;
  });

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
          Alerts.displayError('CAPTCHA_INCORRECT');
          break;
        case 'Quota Exceeded':
          Alerts.displayError('QUOTA_EXCEEDED');
          break;
        default:
          Alerts.displayError('UNKNOWN_ERROR');
      }

      $scope.refreshCaptcha();
      $rootScope.$safeApply();
    };

    $scope.form.$setPristine();
    $scope.form.$setUntouched();

    service.recoverGuid($scope.fields.email, $scope.fields.captcha).then(success).catch(error);
  };

  $scope.refreshCaptcha();
}
