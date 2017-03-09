angular
  .module('walletApp')
  .controller('CoinifyTermsController', CoinifyTermsController);

function CoinifyTermsController ($scope, buySell, $stateParams) {
  $scope.isSell = $scope.$parent.isSell;
  $scope.fields = {};
  console.log('termsController', $scope)
  console.log('isSell', $scope.isSell)
  console.log('stateParams', $stateParams)
  $scope.$parent.acceptTermsForm = $scope.acceptTermsForm;

  $scope.$parent.acceptTerms = () => {
    $scope.status.waiting = true;
    $scope.$parent.exchange = buySell.getExchange();

    return $scope.exchange.signup($stateParams.countryCode, $scope.transaction.currency)
      .then(() => $scope.exchange.fetchProfile())
      .then(() => $scope.getPaymentMediums())
      // then go to next step
      .catch($scope.standardError);
  };

  $scope.$watch('fields', () => {
    $scope.$parent.fields = $scope.fields;
  });
}
