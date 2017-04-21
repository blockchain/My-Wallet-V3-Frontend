
angular
  .module('walletApp')
  .component('buyCheckout', {
    bindings: {
      quote: '<',
      userId: '<',
      buyLimit: '<',
      buyLevel: '<',
      buyAccount: '<',
      collapseSummary: '<',
      handleQuote: '&',
      buySuccess: '&',
      buyError: '&'
    },
    templateUrl: 'templates/buy-checkout.pug',
    controller: BuyCheckoutController,
    controllerAs: '$ctrl'
  });

function BuyCheckoutController ($rootScope, AngularHelper, $scope, $timeout, $q, currency, Wallet, MyWalletHelpers, modals, sfox, $uibModal, formatTrade) {
  $scope.format = currency.formatCurrencyForView;
  $scope.toSatoshi = currency.convertToSatoshi;
  $scope.fromSatoshi = currency.convertFromSatoshi;
  $scope.dollars = currency.currencies.filter(c => c.code === 'USD')[0];
  $scope.bitcoin = currency.bitCurrencies.filter(c => c.code === 'BTC')[0];
  $scope.hasMultipleAccounts = Wallet.accounts().filter(a => a.active).length > 1;
  $scope.btcAccount = Wallet.getDefaultAccount();
  $scope.siftScienceEnabled = false;

  let state = $scope.state = {
    btc: null,
    fiat: null,
    rate: null,
    baseCurr: $scope.dollars,
    get quoteCurr () { return this.baseFiat ? $scope.bitcoin : $scope.dollars; },
    get baseFiat () { return this.baseCurr === $scope.dollars; },
    get total () { return this.fiat; }
  };

  // cached quote from checkout first
  let quote = this.quote;
  if (quote) {
    state.baseCurr = quote.baseCurrency === 'BTC' ? $scope.bitcoin : $scope.dollars;
    state.fiat = state.baseFiat ? $scope.toSatoshi(quote.baseAmount, $scope.dollars) / 100 : null;
    state.btc = !state.baseFiat ? quote.baseAmount : null;
  }

  $scope.resetFields = () => {
    state.fiat = state.btc = null;
    state.baseCurr = $scope.dollars;
  };

  $scope.getQuoteArgs = (state) => ({
    amount: state.baseFiat ? $scope.fromSatoshi(state.fiat, $scope.dollars) * 100 | 0 : state.btc,
    baseCurr: state.baseCurr.code,
    quoteCurr: state.quoteCurr.code
  });

  $scope.cancelRefresh = () => {
    $scope.refreshQuote.cancel();
    $timeout.cancel($scope.refreshTimeout);
  };

  $scope.refreshQuote = MyWalletHelpers.asyncOnce(() => {
    $scope.cancelRefresh();

    let fetchSuccess = (quote) => {
      $scope.quote = quote;
      state.rate = quote.rate;
      state.loadFailed = false;
      $scope.refreshTimeout = $timeout($scope.refreshQuote, quote.timeToExpiration);
      this.collapseSummary = true;
      if (state.baseFiat) state.btc = quote.quoteAmount;
      else state.fiat = $scope.toSatoshi(quote.quoteAmount, $scope.dollars) / 100;
    };

    this.handleQuote($scope.getQuoteArgs(state))
      .then(fetchSuccess, () => { state.loadFailed = true; });
  }, 500, () => {
    $scope.quote = null;
  });

  $scope.getInitialQuote = () => {
    let args = { amount: 1e8, baseCurr: $scope.bitcoin.code, quoteCurr: $scope.dollars.code };
    let quoteP = $q.resolve(this.handleQuote(args));
    quoteP.then(quote => { $scope.state.rate = quote.rate; });
  };

  $scope.refreshIfValid = (field) => {
    if (state[field] && $scope.checkoutForm[field].$valid) {
      $scope.quote = null;
      $scope.refreshQuote();
    } else {
      $scope.cancelRefresh();
    }
  };

  $scope.enableBuy = () => {
    let obj = {
      'BTC Order': $scope.format($scope.fromSatoshi(state.btc || 0, $scope.bitcoin), $scope.bitcoin, true),
      'Payment Method': this.buyAccount.accountType + ' (' + this.buyAccount.accountNumber + ')',
      'TOTAL_COST': $scope.format($scope.fromSatoshi(state.total || 0, $scope.dollars), $scope.dollars, true)
    };

    $uibModal.open({
      controller: function ($scope) { $scope.formattedTrade = formatTrade.confirm(obj); },
      templateUrl: 'partials/confirm-trade-modal.pug',
      windowClass: 'bc-modal trade-summary'
    }).result.then($scope.buy);
  };

  $scope.buy = () => {
    $scope.lock();
    let quote = $scope.quote;
    if (this.buyAccount) {
      sfox.buy(this.buyAccount, quote)
        .then(trade => {
          // Send SFOX user identifier and trade id to Sift Science, inside an iframe:
          if ($rootScope.buySellDebug) {
            console.info('Load Sift Science iframe');
          }
          $scope.tradeId = trade.id;
          sfox.watchTrade(trade);
          this.buySuccess({trade});
        })
        .then(() => $scope.siftScienceEnabled = true)
        .catch(() => this.buyError())
        .finally($scope.resetFields).finally($scope.free);
    } else {
      this.buySuccess({quote});
      $q.resolve().finally($scope.resetFields).finally($scope.free);
    }
  };

  $scope.setLimits = (limit) => {
    $scope.min = $scope.toSatoshi(0.01, $scope.dollars);
    $scope.max = $scope.toSatoshi(limit, $scope.dollars);
  };

  $scope.$watch('$ctrl.buyLimit', (limit) => !isNaN(limit) && $scope.setLimits(limit));
  $scope.$watch('state.fiat', () => state.baseFiat && $scope.refreshIfValid('fiat'));
  $scope.$watch('state.btc', () => !state.baseFiat && $scope.refreshIfValid('btc'));
  $scope.$on('$destroy', $scope.cancelRefresh);
  AngularHelper.installLock.call($scope);
  $scope.getInitialQuote();
}
