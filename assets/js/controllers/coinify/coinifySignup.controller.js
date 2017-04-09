angular
  .module('walletApp')
  .controller('CoinifySignupController', CoinifySignupController);

function CoinifySignupController ($scope, $stateParams, Alerts, buySell, currency) {
  let quote = $scope.vm.quote;
  let exchange = buySell.getExchange();
  let baseFiat = !currency.isBitCurrency({code: quote.baseCurrency});
  let fiatCurrency = baseFiat ? quote.baseCurrency : quote.quoteCurrency;

  let refreshQuote = () => {
    if (baseFiat) return buySell.getQuote(-quote.baseAmount / 100, quote.baseCurrency);
    else return buySell.getQuote(-quote.baseAmount / 100000000, quote.baseCurrency, quote.quoteCurrency);
  };

  $scope.signup = () => {
    return exchange.signup($stateParams.countryCode, fiatCurrency)
      .then(() => exchange.fetchProfile())
      .then(refreshQuote).then((q) => $scope.vm.quote = q)
      .then(() => $scope.vm.goTo('select-payment-medium'))
      .catch((err) => { console.log(err); });
  };
}
