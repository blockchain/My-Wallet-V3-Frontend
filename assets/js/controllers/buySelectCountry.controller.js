angular
  .module('walletApp')
  .controller('BuySelectCountryCtrl', BuySelectCountryCtrl);

function BuySelectCountryCtrl ($scope, country, MyWallet) {
  $scope.countries = country;

  let blacklist = [{'Name': 'Algeria', 'Code': 'DZ'},
                   {'Name': 'Angola', 'Code': 'AO'},
                   {'Name': 'Bosnia and Herzegovina', 'Code': 'BA'},
                   {'Name': 'Guyana', 'Code': 'GY'},
                   {'Name': 'Lao People\'s Democratic Republic', 'Code': 'LA'},
                   {'Name': 'Panama', 'Code': 'PA'},
                   {'Name': 'Papua New Guinea', 'Code': 'PG'},
                   {'Name': 'Uganda', 'Code': 'UG'},
                   {'Name': 'Puerto Rico', 'Code': 'PR'},
                   {'Name': 'United States', 'Code': 'US'},
                   {'Name': 'United States Minor Outlying Islands', 'Code': 'UM'}];

  $scope.countryCodeGuess = $scope.countries.countryCodes.filter(country => country['Code'] === MyWallet.wallet.accountInfo.countryCodeGuess)[0];
  if ($scope.countryCodeGuess) $scope.fields.countryCode = $scope.countryCodeGuess['Code'];

  $scope.$watch('fields.countryCode', (newVal) => {
    $scope.$parent.isCountryBlacklisted = blacklist.some((country) => country['Code'] === newVal);
    if ($scope.$parent.isCountryBlacklisted) $scope.isDisabled();
  });

  $scope.signupForBuyAccess = () => {
    let email = $scope.$parent.fields.email;
    let countryName = $scope.countries.countryCodes.filter(c => c['Code'] === $scope.fields.countryCode)[0]['Name'];
    let url = 'https://docs.google.com/forms/d/e/1FAIpQLSeYiTe7YsqEIvaQ-P1NScFLCSPlxRh24zv06FFpNcxY_Hs0Ow/viewform?entry.1192956638=' + email + '&entry.644018680=' + countryName;
    let otherWindow = window.open(url);

    otherWindow.opener = null;
  };
}
