angular
  .module('walletApp')
  .controller('CoinifyCheckoutController', CoinifyCheckoutController);

function CoinifyCheckoutController ($scope, $rootScope, $stateParams, Env, AngularHelper, MyWallet, $state, Wallet, currency, coinify, Exchange, modals, localStorageService, recurringTrade) {
  $scope.trades = coinify.trades;
  $scope.exchange = coinify.exchange;
  $scope.subscriptions = () => coinify.subscriptions;
  $scope.coinifyService = coinify;

  $scope.buyFiatOptions = currency.coinifyCurrencies;
  $scope.sellFiatOptions = currency.coinifyCurrencies.filter((c) => c.code !== 'USD');
  let buyMatch = $scope.buyFiatOptions.filter(c => c.code === ($scope.exchange.user ? $scope.exchange.profile.defaultCurrency : Wallet.settings.currency.code))[0];
  let sellMatch = $scope.sellFiatOptions.filter(c => c.code === ($scope.exchange.user ? $scope.exchange.profile.defaultCurrency : Wallet.settings.currency.code))[0];

  $scope.buying = coinify.buying;
  $scope.buyHandler = modals.openBuyView;
  $scope.buyQuoteHandler = coinify.getQuote;
  $scope.buyFiatHandler = (currency) => $scope.buyFiat = currency;
  $scope.buyFiat = buyMatch || $scope.buyFiatOptions.filter(c => c.code === 'EUR')[0];
  $scope.buyLimits = () => ({
    max: Math.max(coinify.limits.bank.inRemaining[$scope.buyFiat.code], coinify.limits.card.inRemaining[$scope.buyFiat.code]),
    min: Math.min(coinify.limits.bank.minimumInAmounts[$scope.buyFiat.code], coinify.limits.card.minimumInAmounts[$scope.buyFiat.code])
  });
  $scope.recurringBuyLimit = () => $scope.exchange.user ? coinify.limits.card.inRemaining[$scope.buyFiat.code] : 300;

  $scope.nextRecurring = () => coinify.getNextRecurringTrade();
  $scope.nextRecurringTimespan = () => $scope.nextRecurring().date && recurringTrade.getTimespan(new Date($scope.nextRecurring().date), $scope.nextRecurring().frequency);

  $scope.selling = coinify.selling;
  $scope.sellHandler = modals.openSellView;
  $scope.sellQuoteHandler = coinify.getSellQuote;
  $scope.sellFiatHandler = (currency) => $scope.sellFiat = currency;
  $scope.sellFiat = sellMatch || $scope.sellFiatOptions.filter(c => c.code === 'EUR')[0];
  $scope.sellLimits = () => ({
    min: coinify.limits.blockchain.minimumInAmounts['BTC'],
    max: Math.min(coinify.limits.blockchain.inRemaining['BTC'], Exchange.sellMax)
  });

  $scope.cancelSubscription = (id) => coinify.cancelSubscription(id);

  $scope.openKYC = () => coinify.openPendingKYC();
  $scope.pendingKYC = () => coinify.getPendingKYC() || coinify.getRejectedKYC();

  $scope.pendingTrades = () => coinify.trades.filter((t) => coinify.tradeStateIn(coinify.states.pending)(t) && !t.tradeSubscriptionId);
  $scope.completedTrades = () => coinify.trades.filter((t) => coinify.tradeStateIn(coinify.states.completed)(t) && !t.tradeSubscriptionId);
  $scope.recurringTrades = () => coinify.trades.filter((t) => t.tradeSubscriptionId);
  $scope.frequencyOptions = coinify.buyReason === 'user_needs_account' || ['Weekly', 'Monthly'];

  $scope.hasDismissedRecurringBuyIntro = () => localStorageService.get('dismissedRecurringBuyIntro');
  $scope.dismissRecurringBuyIntro = () => localStorageService.set('dismissedRecurringBuyIntro', true);
  $scope.disableRecurring = coinify.getPendingKYC();

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
    $scope.showRecurringBuy = coinify.showRecurringBuy(env);

    if (env.qaDebugger) {
      $scope.qaDebugger = env.qaDebugger;
      $scope.frequencyOptions = ['Hourly', 'Weekly', 'Monthly'];
    }
  });

  $scope.goToFaq = () => $state.go('wallet.common.faq');

  coinify.pollUserLevel();
  AngularHelper.installLock.call($scope);
}
