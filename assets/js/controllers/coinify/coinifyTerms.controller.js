angular
  .module('walletApp')
  .controller('CoinifyTermsController', CoinifyTermsController);

function CoinifyTermsController ($scope, buySell, $stateParams, Alerts) {
  $scope.isSell = $scope.$parent.isSell;
  $scope.fields = {};
  $scope.$parent.acceptTermsForm = $scope.acceptTermsForm;

  $scope.$parent.acceptTerms = () => {
    $scope.status.waiting = true;
    $scope.$parent.exchange = buySell.getExchange();

    return $scope.exchange.signup($stateParams.countryCode, $scope.$parent.transaction.currency)
      .then(() => $scope.exchange.fetchProfile())
      .then(() => $scope.status = {})
      .then(() => $scope.$parent.nextStep())
      // then go to next step
      .catch(e => {
        console.error('problem creating account', e)
        const msg = `There was a problem creating your Coinify account.`;
        Alerts.displayError(msg);
        $scope.status = {};
      });
  };

  $scope.$watch('fields', () => {
    $scope.$parent.fields = $scope.fields;
  });
}
