angular
  .module('walletApp')
  .controller('SubscribeCtrl', SubscribeCtrl);

function SubscribeCtrl ($scope, MyWallet, country, buySell) {
  $scope.countries = country;

  $scope.fields = {
    email: MyWallet.wallet.accountInfo.email,
    countryCode: MyWallet.wallet.accountInfo.countryCodeGuess
  };

  $scope.signupForAccess = () => {
    let email = $scope.fields.email;
    let country = $scope.countries.countryCodes.filter(c => c['Code'] === $scope.fields.countryCode)[0]['Name'];
    buySell.signupForAccess(email, country);
  };
}
