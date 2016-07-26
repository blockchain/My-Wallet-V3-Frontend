angular
  .module('walletApp')
  .controller('BuyCtrl', BuyCtrl);

function BuyCtrl ($rootScope, $scope, MyWallet, Wallet, Alerts, currency, $uibModalInstance, $uibModal, country, exchange, trades, fiat, trade) {
  $scope.settings = Wallet.settings;
  $scope.btcCurrency = $scope.settings.btcCurrency;
  $scope.currencies = currency.coinifyCurrencies;
  $scope.profile = MyWallet.wallet.profile;
  $scope.countries = country;
  $scope.user = Wallet.user;
  $scope.exchange = exchange;
  $scope.trades = trades;
  $scope.alerts = [];
  $scope.status = {};
  $scope.trade = trade;
  $scope.step = 0;

  $scope.completedTrade = undefined;

  $scope.fields = { email: $scope.user.email };
  $scope.bank = { name: 'bank', fee: 0 };
  $scope.card = { name: 'card', fee: 2.75 };
  $scope.method = $scope.card;
  $scope.transaction = {fiat: 0, btc: 0, fee: 0, total: 0, currency: $scope.settings.currency};
  $scope.transaction.fiat = fiat || 0;
  $scope.paymentInfo = undefined;

  try {
    if (trades.pending.length || trades.completed.length) $scope.userHasExchangeAcct = true;
  } catch (e) {
    $scope.userHasExchangeAcct = false;
  }

  $scope.changeCurrency = (curr) => {
    if (!curr) curr = $scope.settings.currency;

    const error = () => {};
    const success = () => { $scope.transaction.currency = curr; };

    Wallet.changeCurrency(curr).then(success, error);
  };

  $scope.standardError = (err) => {
    console.log(err);
    $scope.status = {};
    try {
      let e = JSON.parse(err);
      let msg = e.error.toUpperCase();
      if (msg === 'EMAIL_ADDRESS_IN_USE') $scope.rejectedEmail = true;
      else Alerts.displayError(msg, true, $scope.alerts, {user: $scope.exchange.user});
    } catch (e) {
      if (e.error) Alerts.displayError(e.error);
      else Alerts.displayError('INVALID_REQUEST', true, $scope.alerts);
    }
  };

  $scope.fetchProfile = () => {
    $scope.status.waiting = true;
    const success = () => {
      $scope.status = {};
    };

    return $scope.exchange.fetchProfile().then(success, $scope.standardError);
  };

  $scope.updateAmounts = () => {
    if (!$scope.quote) return;
    if (!$scope.exchange && !$scope.exchange.user) return;
    let fiatAmt = $scope.transaction.fiat;
    let methodFee = fiatAmt * ($scope.method.fee / 100);

    $scope.transaction.methodFee = methodFee.toFixed(2);
    $scope.transaction.btc = currency.formatCurrencyForView($scope.quote.quoteAmount / 100, currency.bitCurrencies[0]);
    $scope.transaction.total = fiatAmt +
                               +$scope.transaction.methodFee;
  };

  // $scope.verifyConfirmationCode = (code, successCallback, errorCallback) => {
  //   const success = () => {
  //     $scope.user.isEmailVerified = true;
  //     successCallback();
  //     $scope.nextStep();
  //   };

  //   const error = (err) => $scope.standardError(err); errorCallback();

  //   Wallet.verifyEmail($scope.confirmationCode.bcAsyncForm.input.$viewValue, success, error);
  // };

  // move to directive
  $scope.getQuote = () => {
    if (!$scope.exchange) return;
    if (!$scope.exchange.user) return;

    $scope.transaction.btc = 0;
    $scope.quote = null;

    let amt = $scope.transaction.fiat;
    let curr = $scope.transaction.currency.code;
    if (!amt) return;
    $scope.status.waiting = true;

    const success = (quote) => {
      $scope.status = {};
      $scope.quote = quote;
      $scope.updateAmounts();
      Alerts.clear($scope.alerts);
    };

    $scope.exchange.getQuote(amt, curr).then(success, $scope.standardError);
  };

  $scope.toggleEmail = () => $scope.editEmail = !$scope.editEmail;

  $scope.addExchange = () => {
    if (!$scope.profile.countryCode) return;
    if (!MyWallet.wallet.external.coinify) MyWallet.wallet.external.addCoinify();
    $scope.exchange = MyWallet.wallet.external.coinify;
    $scope.partner = 'Coinify';
  };

  $scope.nextStep = () => {
    if (!$scope.transaction.fiat) {
      $scope.step = 0;
    } else if (!$scope.profile.countryCode) {
      $scope.step = 1;
    } else if (!$scope.user.isEmailVerified) {
      $scope.step = 2;
    } else if ($scope.rejectedEmail) {
      $scope.step = 2;
    } else if (!$scope.exchange || !$scope.exchange.user) {
      $scope.step = 3;
    } else if (!$scope.trade) {
      $scope.step = 4;
    } else if (!$scope.paymentInfo && !$scope.completedTrade) {
      $scope.step = 5;
    } else if (!$scope.completedTrade) {
      $scope.step = 6;
    } else {
      $scope.step = 7;
    }
  };

  $scope.prevStep = () => {
    try {
      if ($scope.exchange.user) {
        $scope.step = 0;
      } else if ($scope.step > 2) {
        $scope.step = 1;
      } else {
        $scope.step--;
      }
    } catch (e) {
      $scope.step--;
    }
  };

  $scope.isDisabled = () => {
    if ($scope.step === 0) {
      return !($scope.transaction.fiat > 0);
    } else if ($scope.step === 1) {
      return !$scope.profile.countryCode;
    } else if ($scope.step === 3) {
      return !$scope.signupForm.$valid;
    }
  };

  $scope.changeEmail = (email, successCallback, errorCallback) => {
    $scope.rejectedEmail = undefined;

    const success = () => {
      Alerts.clear($scope.alerts);
      $scope.editEmail = false; successCallback();
    };
    const error = () => $scope.editEmail = false; errorCallback();

    Wallet.changeEmail(email, success, error);
  };

  $scope.signup = () => {
    $scope.status.waiting = true;

    const success = () => {
      $scope.status = {};
      Alerts.clear($scope.alerts);
      $scope.fetchProfile().then($scope.getQuote);
    };

    $scope.exchange.signup()
      .then(success).catch($scope.standardError);
  };

  $scope.watchTrade = () => {
    if (!$scope.trade) return;

    const success = () => {
      Alerts.clear();
      $scope.bitcoinReceived = true;
      // fix this asap
      let label = MyWallet.wallet.hdwallet.defaultAccount.label;

      Alerts.confirm('BITCOIN_RECEIVED', {success: true, action: 'CLOSE', iconClass: 'ti-money', values: {label: label}});
    };

    $scope.trade.bitcoinReceived().then(success);
  };

  $scope.buy = () => {
    $scope.status.waiting = true;

    const success = (trade) => {
      Alerts.clear($scope.alerts);
      $scope.trade = trade;
    };

    $scope.exchange.buy($scope.transaction.fiat, $scope.transaction.currency.code, $scope.method.name).then(success, $scope.standardError).then($scope.watchTrade);
  };

  $scope.loadISX = () => {
    if ($scope.step === 5) return;
    $scope.status = {};
    $scope.nextStep();
  };

  $scope.formatTxProps = (tx) => {
    tx['Purchased'] = $scope.trade.inAmount + ' ' + $scope.trade.inCurrency;
    tx['BTC Amount'] = $scope.trade.outAmountExpected;
    tx['BTC Address'] = $scope.trade.receiveAddress;
    tx['Coinify Trade'] = $scope.trade.id;
    tx['Date'] = $scope.trade.createdAt;

    return tx;
  };

  $scope.completeTrade = (opts) => {
    let txProps = $scope.formatTxProps(opts.tx);
    $scope.completedTrade = {
      error: opts.error,
      txProps: txProps,
      namespace: opts.namespace,
      icon: opts.icon
    };
  };

  $scope.declinedTx = (tx) => {
    $scope.completeTrade({tx: tx, error: true, icon: 'ti-alert', namespace: 'DECLINED_TRANSACTION'});
  };

  $scope.failedTx = (tx) => {
    $scope.completeTrade({tx: tx, error: true, icon: 'ti-alert', namespace: 'FAILED_TRANSACTION'});
  };

  $scope.reviewTx = (tx) => {
    $scope.completeTrade({tx: tx, error: true, icon: 'ti-alert', namespace: 'TX_IN_REVIEW'});
  };

  $scope.expiredTx = (tx) => {
    $scope.completeTrade({tx: tx, error: true, icon: 'ti-alert', namespace: 'TX_EXPIRED'});
  };

  $scope.successTx = (tx) => {
    // fix asap
    let label = MyWallet.wallet.hdwallet.defaultAccount.label;

    $scope.completeTrade({tx: tx, icon: 'ti-check', values: {label: label}, namespace: 'TX_SUCCESSFUL'});
  };

  $scope.cancel = () => {
    $uibModalInstance.dismiss('');
    $scope.trade = null;
  };

  $scope.close = (acct) => {
    let text = '';
    let action = '';
    if ($scope.step === 0) {
      text = 'CONFIRM_CLOSE_AMT';
      action = 'CLOSE';
    } else if (!acct && $scope.step > 0) {
      text = 'CONFIRM_CLOSE_ACCT';
      action = 'IM_DONE';
    } else if (acct) {
      text = 'CONFIRM_CLOSE';
      action = 'CLOSE';
    } else {
      text = 'CONFIRM_CANCEL';
      action = 'IM_DONE';
    }

    Alerts.confirm(text, {action: action}).then(() => {
      $scope.cancel();
      if (acct) $scope.initExchangeAcct();
    });
  };

  if ($scope.trade) {
    $scope.nextStep();
    $scope.watchTrade();
  }

  $scope.isCurrencySelected = (currency) => currency === $scope.transaction.currency;

  $scope.$watch('method', $scope.updateAmounts);
  $scope.$watch('transaction.fiat', $scope.getQuote);
  $scope.$watchGroup(['exchange.user', 'user.isEmailVerified', 'paymentInfo', 'completedTrade'], $scope.nextStep);

  $scope.$watch('transaction.currency', () => {
    let curr = $scope.transaction.currency || null;
    $scope.currencySymbol = currency.conversions[curr.code];
    $scope.getQuote();
  });

  $scope.$watch('step', () => {
    if (!$scope.partner) $scope.addExchange();
    if ($scope.exchange && $scope.exchange.user && !$scope.exchange.profile) $scope.fetchProfile();
  });

  $scope.initExchangeAcct = () => {
    $scope.userHasExchangeAcct = true;
    $rootScope.$broadcast('initExchangeAcct');
  };

  $scope.initBuy = () => {
    $uibModalInstance.dismiss('');
    $rootScope.$broadcast('initBuy');
  };
}
