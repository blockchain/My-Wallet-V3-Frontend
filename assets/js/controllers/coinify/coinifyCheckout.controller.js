angular
  .module('walletApp')
  .controller('CoinifyCheckoutController', CoinifyCheckoutController);

function CoinifyCheckoutController ($scope, $rootScope, $q, $stateParams, Env, AngularHelper, MyWallet, $state, Alerts, Wallet, currency, coinify, modals, balance) {
  let exchange = coinify.exchange;

  $scope.trades = coinify.trades;
  $scope.coinifyStatus = coinify.getStatus;
  $scope.fiatOptions = currency.coinifyCurrencies;
  let walletCurrencyMatch = $scope.fiatOptions.filter(c => c.code === (exchange.profile ? exchange.profile.defaultCurrency : Wallet.settings.currency.code))[0];

  $scope.buying = coinify.buying;
  $scope.buyHandler = modals.openBuyView;
  $scope.buyQuoteHandler = coinify.getQuote;
  $scope.buyMediumsHandler = (quote) => quote.getPaymentMediums().then((mediums) => $scope.buyLimits = coinify.getLimits(mediums, $scope.fiat.code));

  $scope.selling = coinify.selling;
  $scope.sellHandler = modals.openSellView;
  $scope.sellQuoteHandler = coinify.getSellQuote;
  $scope.sellMediumsHandler = (quote) => quote.getPaymentMediums().then((mediums) => $scope.sellLimits = coinify.getSellLimits(mediums));

  $scope.openKYC = () => modals.openBuyView(null, $scope.pendingKYC());
  $scope.pendingKYC = () => coinify.kycs[0] && coinify.tradeStateIn(coinify.states.pending)(coinify.kycs[0]) && coinify.kycs[0];

  console.log(walletCurrencyMatch);
  $scope.fiat = walletCurrencyMatch || $scope.fiatOptions.filter(c => c.code === 'EUR')[0];

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

  coinify.setSellMax(balance);
  AngularHelper.installLock.call($scope);
}
