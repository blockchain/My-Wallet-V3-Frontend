angular
  .module('walletApp')
  .controller('SignupCtrl', SignupCtrl);

SignupCtrl.$inject = ['$scope', '$state', '$cookies', '$filter', '$timeout', '$translate', 'Wallet', 'currency', 'languages', 'MyWallet'];

function SignupCtrl ($scope, $state, $cookies, $filter, $timeout, $translate, Wallet, currency, languages, MyWallet) {
  $scope.working = false;
  $scope.browser = {disabled: true};

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

  $scope.signup = () => {
    $scope.working = true;

    if ($scope.autoReload) {
      $cookies.put('password', $scope.fields.password);
    }

    $timeout(() => {
      if (!MyWallet.browserCheck()) {
        $scope.browser.disabled = true;
        $scope.browser.msg = $translate.instant('UNSUITABLE_BROWSER');
        $scope.working = false;
      } else {
        $scope.createWallet((uid) => { $state.go('wallet.common.home'); });
      }
    }, 250);
  };

  $scope.createWallet = (success) => {
    Wallet.create($scope.fields.password, $scope.fields.email, $scope.currency_guess, $scope.language_guess, success);
  };

  $scope.$watch('language_guess', (newVal, oldVal) => {
    if (newVal) {
      $translate.use(newVal.code);
    }
  });

  if ($scope.autoCreate) {
    $scope.fields.password = 'password123';
    $scope.fields.confirmation = 'password123';
    $scope.fields.acceptedAgreement = true;
    $scope.fields.email = `${$scope.autoCreate}+${Date.now()}@blockchain.com`;
  }
}
