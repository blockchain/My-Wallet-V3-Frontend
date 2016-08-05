angular
  .module('walletApp')
  .controller('SignupCtrl', SignupCtrl);

SignupCtrl.$inject = ['$scope', '$state', '$cookies', '$filter', '$translate', '$uibModal', 'Wallet', 'Alerts', 'currency', 'languages', 'MyWallet'];

function SignupCtrl ($scope, $state, $cookies, $filter, $translate, $uibModal, Wallet, Alerts, currency, languages, MyWallet) {
  $scope.working = false;
  $scope.alerts = Alerts.alerts;
  $scope.status = Wallet.status;

  $scope.browser = {disabled: true};

  $scope.$watch('status.isLoggedIn', newValue => {
    if (newValue) {
      $scope.busy = false;
      $state.go('signup.finish.show');
    }
  });

  let language_code = $translate.use();
  if (language_code === 'zh_CN') {
    language_code = 'zh-cn';
  }

  let language_guess = $filter('getByProperty')('code', language_code, languages);
  if (language_guess == null) {
    language_guess = $filter('getByProperty')('code', 'en', languages);
  }

  var cur = 'USD';

  switch (language_guess.code) {
    case 'zh-cn':
      cur = 'CNY';
      break;
    case 'ca':
      cur = "EUR";
      break;
    case 'nl':
      cur = 'EUR';
      break;
    default:
  }

  $scope.language_guess = language_guess;

  $scope.currency_guess = $filter('getByProperty')('code', cur, currency.currencies);
  $scope.fields = {
    password: '',
    confirmation: '',
    acceptedAgreement: false,
    email: $state.params.email || ''
  };

  $scope.close = () => {
    Alerts.clear();
    $state.go('wallet.common.home');
  };

  $scope.signup = () => {
    if ($scope.signupForm.$valid) {
      $scope.working = true;
      $scope.$$postDigest(() => {
        if (!MyWallet.browserCheck()) {
          $scope.browser.disabled = true;
          $scope.browser.msg = $translate.instant('UNSUITABLE_BROWSER');
          $scope.working = false;
        } else {
          $scope.createWallet((uid) => {
            $scope.working = false;
            if ($scope.autoReload) {
              $cookies.put('password', $scope.fields.password);
            }
            $scope.close('');
          });
        }
      });
    }
  };

  $scope.createWallet = successCallback => {
    Wallet.create($scope.fields.password, $scope.fields.email, $scope.currency_guess, $scope.language_guess, (uid) => {
      successCallback(uid);
    });
  };

  $scope.$watch('language_guess', (newVal, oldVal) => {
    if (newVal) {
      $translate.use(newVal.code);
    }
  });
}
