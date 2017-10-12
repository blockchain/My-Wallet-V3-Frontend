angular
  .module('walletApp')
  .controller('CoinifyCheckoutController', CoinifyCheckoutController);

function CoinifyCheckoutController ($scope, $rootScope, $stateParams, Env, AngularHelper, MyWallet, $state, Wallet, currency, coinify, modals, balance) {
  $scope.exchange = coinify.exchange;

  $scope.trades = coinify.trades;

  $scope.fiatOptions = currency.coinifyCurrencies;
  let walletCurrencyMatch = $scope.fiatOptions.filter(c => c.code === ($scope.exchange.user ? $scope.exchange.profile.defaultCurrency : Wallet.settings.currency.code))[0];
  $scope.fiat = walletCurrencyMatch || $scope.fiatOptions.filter(c => c.code === 'EUR')[0];
  $scope.fiatHandler = (currency) => $scope.fiat = currency;

  $scope.buying = coinify.buying;
  $scope.buyHandler = modals.openBuyView;
  $scope.buyQuoteHandler = coinify.getQuote;
  $scope.buyLimits = () => ({
    min: Math.min(coinify.limits.bank.minimumInAmounts[$scope.fiat.code], coinify.limits.card.minimumInAmounts[$scope.fiat.code]),
    max: Math.max(coinify.limits.bank.inRemaining[$scope.fiat.code], coinify.limits.card.inRemaining[$scope.fiat.code])
  });

  $scope.selling = coinify.selling;
  $scope.sellHandler = modals.openSellView;
  $scope.sellQuoteHandler = coinify.getSellQuote;
  $scope.sellLimits = () => ({
    min: coinify.limits.blockchain.minimumInAmounts['BTC'],
    max: Math.min(coinify.limits.blockchain.outRemaining['BTC'], coinify.sellMax)
  });

  $scope.pendingKYC = () => coinify.pendingKYC();
  $scope.openKYC = () => modals.openBuyView(null, $scope.pendingKYC());

  Env.then(env => {
    $scope.tabs = {
      selectedTab: $stateParams.selectedTab || 'BUY_BITCOIN',
      options: $rootScope.inMobileBuy
      ? ['BUY_BITCOIN', 'ORDER_HISTORY']
      : ['BUY_BITCOIN', 'SELL_BITCOIN', 'ORDER_HISTORY'],
      select (tab) {
        this.selectedTab = this.selectedTab ? tab : null;
        $state.params.selectedTab = this.selectedTab;
      }
    };
  });

  coinify.pollUserLevel();
  coinify.setSellMax(balance);
  AngularHelper.installLock.call($scope);
}
