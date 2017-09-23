angular
  .module('walletApp')
  .controller('CoinifyCheckoutController', CoinifyCheckoutController);

function CoinifyCheckoutController ($scope, $rootScope, $q, $stateParams, Env, AngularHelper, MyWallet, $state, Alerts, Wallet, currency, coinify, modals, balance) {
  let exchange = MyWallet.wallet.external.coinify;

  $scope.trades = coinify.trades;
  $scope.coinifyStatus = coinify.getStatus;
  $scope.fiatOptions = currency.coinifyCurrencies;

  $scope.buying = coinify.buying;
  $scope.buyHandler = modals.openBuyView;
  $scope.buyQuoteHandler = coinify.getQuote;
  $scope.buyMediumsHandler = (quote) => quote.getPaymentMediums().then((mediums) => $scope.buyLimits = coinify.getLimits(mediums, $scope.fiat.code));

  $scope.selling = coinify.selling;
  $scope.sellHandler = modals.openSellView;
  $scope.sellQuoteHandler = coinify.getSellQuote;
  $scope.sellMediumsHandler = (quote) => quote.getPaymentMediums().then((mediums) => $scope.sellLimits = coinify.getSellLimits(mediums, balance.amount / 1e8));

  if (exchange.profile) {
    $scope.fiat = currency.currencies.filter(c => c.code === exchange.profile.defaultCurrency)[0];
  } else {
    if ($stateParams.countryCode === 'DK') $scope.fiat = currency.currencies.filter(c => c.code === 'DKK')[0];
    else if ($stateParams.countryCode === 'GB') $scope.fiat = currency.currencies.filter(c => c.code === 'GBP')[0];
    else $scope.fiat = currency.currencies.filter(c => c.code === 'EUR')[0];
  }

  let email = MyWallet.wallet.accountInfo.email;
  Env.then(env => {
    // TODO: don't pass all of 'env' into shouldDisplaySellTab()
    $scope.canSeeSellTab = MyWallet.wallet.external.shouldDisplaySellTab(email, env, 'coinify');
    $scope.tabs = {
      selectedTab: $stateParams.selectedTab || 'BUY_BITCOIN',
      options: $rootScope.inMobileBuy || !$scope.canSeeSellTab
      ? ['BUY_BITCOIN', 'ORDER_HISTORY']
      : ['BUY_BITCOIN', 'SELL_BITCOIN', 'ORDER_HISTORY'],
      select (tab) {
        this.selectedTab = this.selectedTab ? tab : null;
        $state.params.selectedTab = this.selectedTab;
      }
    };
  });

  AngularHelper.installLock.call($scope);
}
