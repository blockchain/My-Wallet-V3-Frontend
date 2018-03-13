angular
  .module('walletApp')
  .controller('SfoxBuyCheckoutController', SfoxBuyCheckoutController);

function SfoxBuyCheckoutController ($scope, $timeout, $stateParams, $q, Wallet, MyWalletHelpers, Exchange, Alerts, currency, modals, sfox, $rootScope, buyMobile, localStorageService, MyWallet, Env) {
  let exchange = $scope.checkout.exchange;
  let enableSiftScience = () => $q.resolve($scope.siftScienceEnabled = true);

  $scope.buying = sfox.buying;
  $scope.buyQuoteHandler = sfox.fetchBuyQuote.bind(null, exchange);

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
    $scope.checkout.quote = quote;
    return $q.resolve(sfox.buyTradeDetails($scope.checkout.quote))
      .then(details => {
        $scope.checkout.tradeDetails = details;
        $scope.checkout.type = 'buy';
        $scope.checkout.goTo('confirm');
        return quote;
      });
  };

  $scope.checkout.buyHandler = (quote) => sfox.buy($scope.checkout.state.account, quote)
    .then(trade => $scope.checkout.trade = trade)
    .then(sfox.fetchTrades)
    .then(() => exchange.fetchProfile())
    .then(enableSiftScience)
    .then(() => Wallet.api.incrementPartnerTrade('sfox', 'buy', 'usd', 'btc', true))
    .catch((e) => Alerts.displayError(e));

  $scope.checkout.buyRefresh = () => {
    let { baseAmount, quoteAmount, baseCurrency } = $scope.checkout.quote;
    let btc = baseCurrency === 'BTC' ? baseAmount : quoteAmount;
    return $q.resolve($scope.buyQuoteHandler(btc, $scope.checkout.bitcoin.code, $scope.checkout.dollars.code).then($scope.prepareBuy).then($scope.updateRate));
  };

  $scope.siftScienceEnabled = false;
}
