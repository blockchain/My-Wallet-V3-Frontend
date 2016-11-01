angular
  .module('walletApp')
  .controller('CoinifyCountryController', CoinifyCountryController);

function CoinifyCountryController ($scope, country, MyWallet, buySell) {
  $scope.countries = country;

  // SEPA Countries
  let whitelist = [{'Name': 'Austria', 'Code': 'AT'},
                   {'Name': 'Belgium', 'Code': 'BE'},
                   {'Name': 'Bulgaria', 'Code': 'BG'},
                   {'Name': 'Croatia', 'Code': 'HR'},
                   {'Name': 'Cyprus', 'Code': 'CY'},
                   {'Name': 'Czech Republic', 'Code': 'CZ'},
                   {'Name': 'Denmark', 'Code': 'DK'},
                   {'Name': 'Estonia', 'Code': 'EE'},
                   {'Name': 'Finland', 'Code': 'FI'},
                   {'Name': 'France', 'Code': 'FR'},
                   {'Name': 'Germany', 'Code': 'DE'},
                   {'Name': 'Gibraltar', 'Code': 'GI'},
                   {'Name': 'Greece', 'Code': 'GR'},
                   {'Name': 'Hungary', 'Code': 'HU'},
                   {'Name': 'Iceland', 'Code': 'IS'},
                   {'Name': 'Ireland', 'Code': 'IE'},
                   {'Name': 'Italy', 'Code': 'IT'},
                   {'Name': 'Latvia', 'Code': 'LV'},
                   {'Name': 'Liechtenstein', 'Code': 'LI'},
                   {'Name': 'Lithuania', 'Code': 'LT'},
                   {'Name': 'Luxembourg', 'Code': 'LU'},
                   {'Name': 'Malta', 'Code': 'MT'},
                   {'Name': 'Monaco', 'Code': 'MC'},
                   {'Name': 'Netherlands', 'Code': 'NL'},
                   {'Name': 'Norway', 'Code': 'NO'},
                   {'Name': 'Poland', 'Code': 'PL'},
                   {'Name': 'Portugal', 'Code': 'PT'},
                   {'Name': 'Romania', 'Code': 'RO'},
                   {'Name': 'San Marino', 'Code': 'SM'},
                   {'Name': 'Slovakia', 'Code': 'SK'},
                   {'Name': 'Slovenia', 'Code': 'SI'},
                   {'Name': 'Spain', 'Code': 'ES'},
                   {'Name': 'Sweden', 'Code': 'SE'},
                   {'Name': 'Switzerland', 'Code': 'CH'},
                   {'Name': 'United Kingdom', 'Code': 'GB'}];

  $scope.countryCodeGuess = $scope.countries.countryCodes.filter(country => country['Code'] === MyWallet.wallet.accountInfo.countryCodeGuess)[0];
  if ($scope.countryCodeGuess) $scope.fields.countryCode = $scope.countryCodeGuess['Code'];

  $scope.$watch('fields.countryCode', (newVal) => {
    $scope.$parent.isCountryBlacklisted = !whitelist.some((country) => country['Code'] === newVal);
  });

  $scope.signupForAccess = () => {
    let email = encodeURIComponent($scope.$parent.fields.email);
    let country = $scope.countries.countryCodes.filter(c => c['Code'] === $scope.fields.countryCode)[0]['Name'];
    buySell.signupForAccess(email, country);
  };

  $scope.checkStartsWith = (viewValue, search) => {
    let startsWith = (a, b) => a.toLowerCase().lastIndexOf(b.toLowerCase(), 0) === 0;

    if (!search.length) return true;
    else {
      return viewValue.toLowerCase && startsWith(viewValue, search) ||
             viewValue.name && startsWith(viewValue.name, search);
    }
  };
}
