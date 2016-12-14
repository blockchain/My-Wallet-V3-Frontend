angular
  .module('walletApp')
  .controller('CoinifySignupController', CoinifySignupController);

function CoinifySignupController ($scope, $stateParams, Alerts, buySell) {
  $scope.$parent.signup = () => {
    $scope.status.waiting = true;
    Alerts.clear($scope.alerts);
    $scope.$parent.exchange = buySell.getExchange();

    return $scope.exchange.signup($stateParams.countryCode, $scope.transaction.currency.code)
      .then(() => $scope.exchange.fetchProfile())
      .then(() => $scope.getPaymentMediums())
      .catch($scope.standardError);
  };

  $scope.$watch('signupForm', () => {
    $scope.$parent.signupForm = $scope.signupForm;
  });
}
