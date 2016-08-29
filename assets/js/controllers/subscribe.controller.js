angular
  .module('walletApp')
  .controller('SubscribeCtrl', SubscribeCtrl);

function SubscribeCtrl ($scope, MyWallet, country) {
  $scope.countries = country;

  $scope.fields = {
    email: MyWallet.wallet.accountInfo.email,
    countryCode: MyWallet.wallet.accountInfo.countryCodeGuess
  };

  $scope.submit = () => {
    let email = $scope.fields.email;
    let countryName = $scope.countries.countryCodes.filter(c => c['Code'] === $scope.fields.countryCode)[0]['Name'];
    let url = 'https://docs.google.com/forms/d/e/1FAIpQLSeYiTe7YsqEIvaQ-P1NScFLCSPlxRh24zv06FFpNcxY_Hs0Ow/viewform?entry.1192956638=' + email + '&entry.644018680=' + countryName;
    let otherWindow = window.open(url);

    otherWindow.referrer = null;
  };
}
