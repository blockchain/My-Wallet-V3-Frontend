angular
  .module('walletApp')
  .controller('CoinifyCountryController', CoinifyCountryController);

function CoinifyCountryController ($scope, Options, country, MyWallet, buySell) {
  $scope.countries = country;

  $scope.countryCodeGuess = $scope.countries.countryCodes.filter(country => country['Code'] === MyWallet.wallet.accountInfo.countryCodeGuess)[0];

  // Make sure Next button is disabled while loading Options:
  $scope.$parent.isCountryBlacklisted = true;

  Options.get().then((options) => {
    const whitelist = options.partners.coinify.countries;
    $scope.$watch('fields.countryCode', (newVal) => {
      $scope.$parent.isCountryBlacklisted = !whitelist.some((country) => country === newVal);
    });
  });

  if ($scope.countryCodeGuess) $scope.fields.countryCode = $scope.countryCodeGuess['Code'];

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
