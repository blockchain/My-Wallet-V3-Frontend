angular
  .module('walletApp')
  .controller('LostGuidCtrl', LostGuidCtrl);

function LostGuidCtrl($scope, $rootScope, $http, $translate, Wallet, Alerts) {
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
      switch (res.data.initial_error) {
        case 'Captcha Code Incorrect':
          Alerts.displayError($translate.instant('CAPTCHA_INCORRECT'));
          break;
        case 'Quota Exceeded':
          Alerts.displayError($translate.instant('QUOTA_EXCEEDED'));
          break;
        default:
          Alerts.displayError($translate.instant('UNKNOWN_ERROR'));
      }
    };
    let httpOptions = {
      url     : $rootScope.rootURL + 'wallet/recover-wallet',
      method  : 'GET',
      params  : {
        param1  : $scope.fields.email,
        kaptcha : $scope.fields.captcha,
        format  : 'json'
      },
      withCredentials: true
    };
    $http(httpOptions).then(success).catch(error);
  };

  // Set SID cookie by requesting headers
  $http({
    url: $rootScope.rootURL + 'wallet/login',
    method: 'HEAD',
    withCredentials: true
  }).then($scope.refreshCaptcha);
}
