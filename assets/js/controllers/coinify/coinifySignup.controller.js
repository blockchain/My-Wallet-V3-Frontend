angular
  .module('walletApp')
  .controller('CoinifySignupController', CoinifySignupController);

function CoinifySignupController ($scope, $stateParams, Alerts, buySell, currency) {
  let quote = $scope.vm.quote;
  let exchange = buySell.getExchange();
  let fiatCurrency = !currency.isBitCurrency(quote.baseCurrency) ? quote.baseCurrency : quote.quoteCurrency;

  $scope.signup = () => {
    return exchange.signup($stateParams.countryCode, fiatCurrency)
      .then(() => exchange.fetchProfile())
      .then(() => buySell.getPaymentMediums(quote))
      .then(() => $scope.vm.goTo('select-payment-medium'))
      .catch((err) => { console.log(err); });
  };
}
