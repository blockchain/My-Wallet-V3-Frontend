angular
  .module('walletApp')
  .controller('CoinifyTermsController', CoinifyTermsController);

function CoinifyTermsController ($scope, buySell, $stateParams) {
  $scope.isSell = $scope.$parent.isSell;
  $scope.fields = {};
  $scope.$parent.acceptTermsForm = $scope.acceptTermsForm;

  $scope.$parent.acceptTerms = () => {
    $scope.status.waiting = true;
    $scope.$parent.exchange = buySell.getExchange();

    return $scope.exchange.signup($stateParams.countryCode, $scope.$parent.transaction.currency)
      .then(() => $scope.exchange.fetchProfile())
      .then(() => $scope.$parent.nextStep())
      // then go to next step
      .catch(e => console.log('problem creating account', e));
  };

  $scope.$watch('fields', () => {
    $scope.$parent.fields = $scope.fields;
  });
}
