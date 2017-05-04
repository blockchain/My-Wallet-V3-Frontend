angular
  .module('walletApp')
  .controller('BuySellCtrl', BuySellCtrl);

function BuySellCtrl ($rootScope, AngularHelper, $scope, $state, Alerts, Wallet, currency, buySell, MyWallet, $q, options, $stateParams, modals) {
  $scope.buySellStatus = buySell.getStatus;
  $scope.trades = buySell.trades;

  $scope.status = {
    loading: false,
    modalOpen: false
  };

  $scope.walletStatus = Wallet.status;
  $scope.status.metaDataDown = $scope.walletStatus.isLoggedIn && !$scope.buySellStatus().metaDataService;

  $scope.onCloseModal = () => {
    $scope.status.modalOpen = false;
    $scope.kyc = buySell.kycs[0];
    buySell.pollKYC();
  };

  $scope.initialize = () => {
    $scope.currencies = currency.coinifyCurrencies;
    $scope.settings = Wallet.settings;
    $scope.transaction = { fiat: undefined, currency: buySell.getCurrency() };
    $scope.sellTransaction = { fiat: undefined, currency: buySell.getCurrency(undefined, true) };
    $scope.sellCurrencySymbol = currency.conversions[$scope.sellTransaction.currency.code];
    $scope.limits = {card: {}, bank: {}};
    $scope.sellLimits = {card: {}, bank: {}};
    $scope.state = {buy: true};
    $scope.rating = 0;

    $scope.buy = (quote, trade) => {
      if (!$scope.status.modalOpen) {
        $scope.status.modalOpen = true;
        modals.openBuyView(quote, trade).result.finally($scope.onCloseModal).catch($scope.onCloseModal);
      }
    };

    $scope.sell = (trade, bankMedium, payment, options) => {
      if (!$scope.status.modalOpen) {
        $scope.status.modalOpen = true;
        buySell.openSellView(trade, bankMedium, payment, options).finally(() => {
          $scope.onCloseModal();
        });
      }
    };

    // for quote
    buySell.getExchange();

    $scope.$watch('settings.currency', () => {
      $scope.transaction.currency = buySell.getCurrency();
      $scope.sellTransaction.currency = buySell.getCurrency(undefined, true);
    }, true);

    $scope.$watch('sellTransaction.currency', (newVal, oldVal) => {
      let curr = $scope.sellTransaction.currency || null;
      $scope.sellCurrencySymbol = currency.conversions[curr.code];
      // if (newVal !== oldVal) $scope.getMaxMin($scope.sellLimits, $scope.sellTransaction);
    });

    if (buySell.getStatus().metaDataService && buySell.getExchange().user) {
      $scope.status.loading = true;
      $scope.exchange = buySell.getExchange();
      $scope.exchangeCountry = $scope.exchange._profile._country || $stateParams.countryCode;

      buySell.fetchProfile().then(() => {
        let currency = buySell.getExchange().profile.defaultCurrency;
        let getCurrencies = buySell.getExchange().getBuyCurrencies().then(currency.updateCoinifyCurrencies);

        let getMaxLimits = buySell.getMaxLimits(currency).then($scope.limits = buySell.limits)
                                                         .catch(() => $scope.fetchLimitsError = true);

        let getTrades = buySell.getTrades().then(() => {
          let pending = buySell.trades.pending;
          $scope.pendingTrade = pending.sort((a, b) => b.id - a.id)[0];
        }).catch(() => {
          $scope.fetchTradeError = true;
        });

        let getKYCs = buySell.getKYCs().then(() => {
          $scope.kyc = buySell.kycs[0];
          if ($scope.exchange.profile) { // NOTE added .profile here
            if (+$scope.exchange.profile.level.name < 2) {
              if ($scope.kyc) {
                buySell.pollKYC();
              } else {
                buySell.getKYCs().then(kycs => {
                  if (kycs.length > 0) buySell.pollKYC();
                  $scope.kyc = kycs[0];
                });
              }
            }
          } else {
            $scope.$watch(buySell.getExchange, (ex) => $scope.exchange = ex);
          }
        }).catch(() => {
          $scope.fetchKYCError = true;
        });

        $q.all([getTrades, getKYCs, getCurrencies, getMaxLimits]).then(() => {
          $scope.status.loading = false;
          $scope.status.disabled = false;
        });
      }).catch(() => {
        $scope.status.loading = false;
        $scope.status.exchangeDown = true;
        AngularHelper.$safeApply($scope);
      });
    } else {
      $scope.status.disabled = false;
    }

    $scope.openKyc = () => {
      ['declined', 'rejected', 'expired'].indexOf($scope.kyc.state) > -1
        ? buySell.triggerKYC().then(kyc => $scope.buy(null, kyc))
        : $scope.buy(null, $scope.kyc);
    };

    $scope.openSellKyc = () => {
      if (!$scope.kyc) {
        buySell.triggerKYC().then(kyc => $scope.sell(kyc));
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

    $scope.submitFeedback = (rating) => buySell.submitFeedback(rating);
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

  $scope.getIsTradingDisabled = () => {
    let profile = $scope.exchange && $scope.exchange.profile;
    let disabled = options.partners.coinify.disabled;
    let canTrade = profile && profile.canTrade;

    return canTrade === false || disabled;
  };

  $scope.getIsTradingDisabledReason = () => {
    let disabled = options.partners.coinify.disabled;
    let profile = $scope.exchange && $scope.exchange.profile;
    let cannotTradeReason = profile && profile.cannotTradeReason;

    if (disabled) cannotTradeReason = 'disabled';
    return cannotTradeReason;
  };

  $scope.setSellLimits = () => {
    if ($scope.exchange._profile) {
      $scope.sellLimits = $scope.exchange._profile._currentLimits._bank._outRemaining;
    }
  };

  const ONE_DAY_MS = 86400000;

  $scope.getDays = () => {
    let profile = buySell.getExchange().profile;
    let verifyDate = profile && profile.canTradeAfter;
    return isNaN(verifyDate) ? 1 : Math.ceil((verifyDate - Date.now()) / ONE_DAY_MS);
  };

  let email = MyWallet.wallet.accountInfo.email;
  let walletOptions = options;
  $scope.canSeeSellTab = MyWallet.wallet.external.shouldDisplaySellTab(email, walletOptions, 'coinify');

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

  $rootScope.$on('fetchExchangeProfile', () => {
    $scope.status.disabled = true;
    $scope.initialize();
  });

  AngularHelper.installLock.call($scope);
}
