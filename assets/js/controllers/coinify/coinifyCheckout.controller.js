angular
  .module('walletApp')
  .controller('CoinifyCheckoutController', CoinifyCheckoutController);

function CoinifyCheckoutController ($rootScope, Env, AngularHelper, $scope, $state, Alerts, Wallet, currency, coinify, MyWallet, $q, $stateParams, modals) {
  const ONE_DAY_MS = 86400000;

  let exchange = MyWallet.wallet.external.coinify;

  $scope.buying = {};
  $scope.selling = {};
  $scope.trades = coinify.trades;
  $scope.coinifyStatus = coinify.getStatus;
  $scope.fiatOptions = currency.coinifyCurrencies;
  $scope.mediumsHandler = (quote) => quote.getPaymentMediums().then((mediums) => $scope.limits = coinify.getLimits(mediums, $scope.fiat.code));

  $scope.buyHandler = modals.openBuyView;
  $scope.buyQuoteHandler = coinify.getQuote;

  $scope.sellHandler = modals.openSellView;
  $scope.sellQuoteHandler = coinify.getSellQuote;

  if (exchange.profile) {
    $scope.fiat = currency.currencies.filter(c => c.code === exchange.profile.defaultCurrency)[0];
  } else {
    if ($stateParams.countryCode === 'DK') $scope.fiat = currency.currencies.filter(c => c.code === 'DKK')[0];
    else if ($stateParams.countryCode === 'GB') $scope.fiat = currency.currencies.filter(c => c.code === 'GBP')[0];
    else $scope.fiat = currency.currencies.filter(c => c.code === 'EUR')[0];
  }

  $scope.walletStatus = Wallet.status;
  $scope.status.metaDataDown = $scope.walletStatus.isLoggedIn && !$scope.coinifyStatus().metaDataService;

  $scope.onCloseModal = () => {
    $scope.kyc = coinify.kycs[0];
    coinify.pollKYC();
  };

  $scope.initialize = () => {
    $scope.settings = Wallet.settings;

    $scope.openKyc = () => {
      $q.resolve(coinify.getOpenKYC())
        .then((kyc) => $scope.buy(null, kyc));
    };

    $scope.openSellKyc = () => {
      if (!$scope.kyc) {
        coinify.triggerKYC().then(kyc => $scope.sell(kyc));
      } else {
        $scope.sell($scope.kyc);
      }
    };

    $scope.changeCurrency = (curr) => {
      if (curr && $scope.currencies.some(c => c.code === curr.code)) {
        $scope.transaction.currency = curr;
      }
    };

    $scope.changeSellCurrency = (curr) => {
      if (curr && $scope.currencies.some(c => c.code === curr.code)) {
        $scope.sellTransaction.currency = curr;
        $scope.sellCurrencySymbol = currency.conversions[curr.code];
      }
    };
  };

  let watchLogin;

  if (Wallet.status.isLoggedIn) {
    $scope.initialize();
  } else {
    watchLogin = $scope.$watch('status.isLoggedIn', (isLoggedIn) => {
      if (isLoggedIn) {
        $scope.initialize();
        watchLogin();
      }
    });
  }

  // Trading Disabled Logic
  Env.then(env => {
    let profile = exchange && exchange.profile;
    let canTrade = profile && profile.canTrade;
    let disabled = env.partners.coinify.disabled;
    let isDisabledReason = profile && profile.cannotTradeReason;
    let isDisabledUntil = profile && isNaN(profile.canTradeAfter) ? 1 : Math.ceil((profile.canTradeAfter - Date.now()) / ONE_DAY_MS);

    if (disabled || !canTrade) {
      $scope.selling = $scope.buying;
      $scope.buying.isDisabled = true;
      $scope.buying.isDisabledUntil = isDisabledUntil;
      $scope.buying.isDisabledReason = isDisabledReason || 'disabled';
      $scope.buying.launchOption = coinify.openPendingTrade;
    }
  });

  $scope.setSellLimits = () => {
    if ($scope.exchange._profile) {
      $scope.sellLimits = $scope.exchange._profile._currentLimits._bank._outRemaining;
    }
  };

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
