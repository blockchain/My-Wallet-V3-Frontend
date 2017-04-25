angular
  .module('walletApp')
  .controller('SubscribeCtrl', SubscribeCtrl);

function SubscribeCtrl ($rootScope, $scope, MyWallet, country, state, buySell, localStorageService, $uibModalStack) {
  $scope.countries = country;
  $scope.states = state;
  $scope.data = {};

  $scope.fields = {
    stateCode: '',
    email: MyWallet.wallet.accountInfo.email,
    countryCode: MyWallet.wallet.accountInfo.countryCodeGuess
  };

  $scope.signupForAccess = () => {
    let email = encodeURIComponent($scope.fields.email);
    buySell.signupForAccess(email, $scope.fields.country);
  };

  $scope.subscribe = () => {
    localStorageService.set('subscribed', true);
    $rootScope.isSubscribed = true;
    $uibModalStack.dismissAll();
  };

  $scope.$watch('fields.countryCode', (countryCode) => {
    countryCode && ($scope.fields.country = $scope.countries.countryCodes.filter(c => c['Code'] === $scope.fields.countryCode)[0]['Name']);
  });

  $scope.$watch('fields.stateCode', (stateCode) => {
    stateCode && ($scope.fields.state = $scope.states.stateCodes.filter(s => s['Code'] === $scope.fields.stateCode)[0]['Name']);
  });
}
