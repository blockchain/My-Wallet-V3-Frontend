angular
  .module('walletApp')
  .controller('SfoxBuyCheckoutController', SfoxBuyCheckoutController);

function SfoxBuyCheckoutController ($scope, $timeout, $stateParams, $q, Wallet, MyWalletHelpers, Exchange, Alerts, currency, modals, sfox, $rootScope, buyMobile, localStorageService, MyWallet, Env) {
  console.log('SfoxBuyCheckoutController', $scope, $scope.checkout);
  let exchange = $scope.checkout.exchange;
  let enableSiftScience = () => $q.resolve($scope.siftScienceEnabled = true);

  $scope.buying = sfox.buying;
  $scope.buyQuoteHandler = sfox.fetchBuyQuote.bind(null, exchange);

  // $scope.sellHandler = (quote) => sfox.sell($scope.checkout.state.account, quote)
  //   .then(submitTx)
  //   .then(recordNote)
  //   .then($scope.checkout.fetchTransactions)
  //   .then(enableSiftScience)
  //   .catch((e) => Alerts.displayError(e));

  const setRate = (res) => { $scope.rate = Math.abs(res.quoteAmount); };
  $scope.getRate = () => $scope.buyQuoteHandler(1e8, 'BTC', $scope.checkout.dollars.code).then(setRate);
  $scope.getRate();

  $scope.updateRate = (quote) => $scope.rate = quote.rate;

  $scope.buyLimits = () => {
    return {
      min: 10,
      max: sfox.profile.limits.buy
    };
  };

  $scope.prepareBuy = (quote) => {
    console.log('buyHandler', quote);
    $scope.quote = quote;
    $scope.checkout.goTo('confirm');
    $scope.buyDetails = sfox.buyTradeDetails($scope.quote);
  };

  $scope.buyHandler = (quote) => {
    // let amt = quote.baseCurrency === 'BTC' ? quote.baseAmount : quote.quoteAmount;
    // $scope.payment.sideEffect((payment) => {
    //   $scope.quote = quote;
    //   $scope.goTo('confirm');
    //   $scope.sellDetails = sfox.sellTradeDetails($scope.quote, payment);
    // });
  };

  $scope.buyRefresh = () => {
    let { baseAmount, quoteAmount, baseCurrency } = $scope.quote;
    let btc = baseCurrency === 'BTC' ? baseAmount : quoteAmount;
    return $q.resolve($scope.buyQuoteHandler(btc, $scope.checkout.bitcoin.code, $scope.checkout.dollars.code).then($scope.updateRate));
  };

  $scope.siftScienceEnabled = false;
}
