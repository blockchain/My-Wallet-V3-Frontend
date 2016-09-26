angular
  .module('walletApp')
  .controller('BuyAcceptTermsCtrl', BuyAcceptTermsCtrl);

function BuyAcceptTermsCtrl ($scope, Alerts, buySell) {
  $scope.$parent.signup = () => {
    $scope.status.waiting = true;
    Alerts.clear($scope.alerts);
    $scope.$parent.exchange = buySell.getExchange();

    return $scope.exchange.signup($scope.fields.countryCode, $scope.transaction.currency.code)
      .then(() => $scope.exchange.fetchProfile())
      .then(() => $scope.getPaymentMethods())
      .catch($scope.standardError);
  };

  $scope.$watch('signupForm', () => {
    $scope.$parent.signupForm = $scope.signupForm;
  });
}
