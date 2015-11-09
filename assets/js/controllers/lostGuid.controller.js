angular
  .module('walletApp')
  .controller('LostGuidCtrl', LostGuidCtrl);

function LostGuidCtrl($scope, $http, $translate, Wallet) {
  $scope.currentStep = 1;
  $scope.captchaSrc = 'https://blockchain.info/kaptcha.jpg?timestamp=';
  $scope.fields = {
    email: '',
    captcha: '',
  };
  $scope.refreshCaptcha = () => {
    let time = new Date().getTime();
    $scope.captchaSrc = `https://blockchain.info/kaptcha.jpg?timestamp=${time}`;
  };
  $scope.sendReminder = () => {
    $scope.working = true;
    let success = (res) => {
      console.log(res.data);
      $scope.working = false;
      $scope.currentStep = 2;
    };
    let error = (err) => {
      console.log(err);
      $scope.working = false;
      $scope.captchaError = true;
      $scope.refreshCaptcha();
      $translate('CAPTCHA_INCORRECT').then(translation => {
        Wallet.displayError(translation);
      });
    };
    let httpOptions = {
      url     : 'https://blockchain.info/wallet/recover-wallet',
      method  : 'GET',
      params  : {
        param1  : $scope.fields.email,
        kaptcha : $scope.fields.captcha,
        format  : 'json'
      }
    };
    $http(httpOptions).then(success).catch(error);
  };
}
