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

  let cur;
  const country_code = 'nl'; // TODO: get from endpoint
  switch (country_code) { // iso-3166-2
    case 'us':
    case 'io': // British Indian Ocean Territory (de-facto)
      cur = 'USD';
      break;
    // Eurozone countries:
    case 'at':
    case 'be':
    case 'cy':
    case 'ee':
    case 'fi':
    case 'fr':
    case 'de':
    case 'gr':
    case 'ie':
    case 'it':
    case 'lv':
    case 'lt':
    case 'lu':
    case 'mt':
    case 'nl':
    case 'pt':
    case 'sk':
    case 'si':
    case 'es':
    // Euro de-facto currency:
    case 'mc': // Monaco
    case 'sm': // San Marino
    case 'va': // Vatican City
    case 'ad': // Andorra
    case 'pm': // Saint Pierre and Miquelon
    case 'yt': // Mayotte
    case 'bl': // Saint Barthélemy
    case 'xk': // Kosovo
    case 'me': // Montenegro
    // EUR is probably best alternative we support:
    case 'no': // Norway
    case 'al': // Albania
    case 'ba': // Bosnia and Herzegovina
    case 'mk': // Macedonia
    case 'rs': // Serbia
    case 'tr': // Turkey
    case 'md': // Moldova
    case 'cz': // Czech Republic
      cur = 'EUR';
      break;
    case 'is': // Iceland
      cur = 'ISK';
      break;
    case 'hk': // Hong Kong
      cur = 'HKD';
      break;
    case 'tw': // Taiwan
      cur = 'TWD';
      break;
    case 'ch': // Switserland
    case 'li': // Liechtenstein
      cur = 'CHF';
      break;
    case 'dk': // Denmark
    case 'gl': // Greenland
    case 'fo': // Faroe Islands
      cur = 'DKK';
      break;
    case 'cl': // Chili
      cur = 'CLP';
      break;
    case 'ca': // Canada
      cur = 'CAD';
      break;
    case 'cn': // China
    case 'mo': // Macau (or is HKD better?)
      cur = 'CNY';
      break;
    case 'th': // Thailand
      cur = 'THB';
      break;
    case 'au': // Australia
      cur = 'AUD';
      break;
    case 'sg': // Singapore
      cur = 'SGD';
      break;
    case 'kr': // South Korea
      cur = 'KRW';
      break;
    case 'jp': // Japan
      cur = 'JPY';
      break;
    case 'pl': // Poland
      cur = 'PLN';
      break;
    case 'gb': // Great Britain, United Kingdom, Channel Islands
    case 'im': // Isle of Man
    case 'gg': // Guernsey
    case 'ss': // South Georgia and the South Sandwich Islands
      cur = 'GBP';
      break;
    case 'se': // Sweden
      cur = 'SEK';
      break;
    case 'nz': // New Zealand
      cur = 'NZD';
      break;
    case 'br': // Brazil
      cur = 'BRL';
      break;
    case 'ru': // Russia
      cur = 'RUB';
      break;
    default:
      cur = 'USD'; // One day this will be BTC
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
