angular
  .module('walletApp')
  .controller('BuySelectCountryCtrl', BuySelectCountryCtrl);

function BuySelectCountryCtrl ($scope, country, MyWallet, buySell) {
  $scope.countries = country;

  let blacklist = [{'Name': 'Algeria', 'Code': 'DZ'},
                   {'Name': 'Angola', 'Code': 'AO'},
                   {'Name': 'Brazil', 'Code': 'BR'},
                   {'Name': 'Bosnia and Herzegovina', 'Code': 'BA'},
                   {'Name': 'Guyana', 'Code': 'GY'},
                   {'Name': 'Lao People\'s Democratic Republic', 'Code': 'LA'},
                   {'Name': 'Panama', 'Code': 'PA'},
                   {'Name': 'Papua New Guinea', 'Code': 'PG'},
                   {'Name': 'Uganda', 'Code': 'UG'},
                   {'Name': 'Puerto Rico', 'Code': 'PR'},
                   {'Name': 'Romania', 'Code': 'RO'},
                   {'Name': 'United States', 'Code': 'US'},
                   {'Name': 'United States Minor Outlying Islands', 'Code': 'UM'}];

  $scope.countryCodeGuess = $scope.countries.countryCodes.filter(country => country['Code'] === MyWallet.wallet.accountInfo.countryCodeGuess)[0];
  if ($scope.countryCodeGuess) $scope.fields.countryCode = $scope.countryCodeGuess['Code'];

  $scope.$watch('fields.countryCode', (newVal) => {
    $scope.$parent.isCountryBlacklisted = blacklist.some((country) => country['Code'] === newVal);
    if ($scope.$parent.isCountryBlacklisted) $scope.isDisabled();
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
