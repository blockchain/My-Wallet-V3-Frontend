angular
  .module('walletApp')
  .controller('CoinifyTermsController', CoinifyTermsController);

function CoinifyTermsController ($scope, buySell, $stateParams, Alerts, $q, Wallet) {
  $scope.isSell = $scope.$parent.isSell;
  $scope.fields = {};
  $scope.$parent.acceptTermsForm = $scope.acceptTermsForm;
  $scope.sellEmailVerified = true;

  $scope.$parent.verifyEmail = () => {
    $q(Wallet.verifyEmail.bind(null, $scope.$parent.fields.emailVerification)).catch((err) => {
      Alerts.displayError(err);
    });
  };

  $scope.$parent.acceptTerms = () => {
    $scope.status.waiting = true;
    $scope.$parent.exchange = buySell.getExchange();

    return $scope.exchange.signup($stateParams.countryCode, $scope.$parent.transaction.currency)
      .then(() => $scope.exchange.fetchProfile())
      .then(() => $scope.$parent.nextStep())
      .catch($scope.standardError);
  };

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

  $scope.$watch('fields', () => {
    $scope.$parent.fields = $scope.fields;
  });
}
