angular
  .module('walletApp')
  .controller('CoinifySummaryController', CoinifySummaryController);

function CoinifySummaryController ($scope, $q, $timeout, Wallet, buySell, currency, Alerts, smartAccount) {
  $scope.$parent.limits = {};
  $scope.format = currency.formatCurrencyForView;
  $scope.btcCurrency = currency.bitCurrencies[0];
  $scope.exchange = buySell.getExchange();
  $scope.toggleEditAmount = () => $scope.$parent.editAmount = !$scope.$parent.editAmount;
  // $scope.isBankTransfer = () => $scope.isMedium('bank');
  $scope.trade = $scope.$parent.$parent.trade;
  $scope.transaction = $scope.$parent.$parent.transaction;
  console.log('coinify summary ctrl scope', $scope)

  $scope.getMaxMin = (curr) => {
    const calculateMin = (rate) => {
      $scope.$parent.limits.min = (rate * 10).toFixed(2);
    };

    const calculateMax = (rate) => {
      $scope.$parent.limits.max = buySell.calculateMax(rate, $scope.medium).max;
      $scope.$parent.limits.available = buySell.calculateMax(rate, $scope.medium).available;
    };

    return buySell.fetchProfile(true).then(() => {
      let min = buySell.getRate('EUR', curr.code).then(calculateMin);
      let max = buySell.getRate($scope.exchange.profile.defaultCurrency, curr.code).then(calculateMax);
      return $q.all([min, max]).then($scope.setParentError);
    });
  };

  // build().publish().payment.then()
  // send controller line 202
  //sign().publish

  // $scope.getFee = () => {
  //   const index = Wallet.getDefaultAccountIndex();
  //   // to get fee
  //   // payment.sideEffect
  //   // .fee(absoluteFeeBounds [0])
  //
  //   console.log('index', index)
  //
  //
  //   $scope.payment = Wallet.my.wallet.createPayment();
  //
  //   console.log('scope from inside getFee', $scope)
  //
  //   $scope.payment.from(index).amount(100000)
  //
  //   $scope.payment.sideEffect(result => {
  //     console.log('result of sideEffect', result)
  //     $scope.fee = result.absoluteFeeBounds[0];
  //     console.log('$scope.fee', $scope.fee)
  //     $scope.btcFee = currency.convertFromSatoshi($scope.fee, $scope.btcCurrency);
  //     // const fiatFee = ($scope.transaction.fiat / $scope.transaction.btc) * $scope.fee;
  //     // $scope.amountOwed =
  //   })
  // };
  //
  // $scope.getFee();

  $scope.convertFeeToFiat = () => {
    return $scope.transaction.fiat / $scope.fee;
  };

  $scope.setTotal = (baseAmount, fee) => {
    return baseAmount - fee;
  };

  $scope.commitValues = () => {
    $scope.$parent.quote = null;
    $scope.status.waiting = true;
    $scope.transaction.currency = $scope.tempCurrency;
    $scope.transaction.fiat = $scope.tempFiat;
    $scope.getQuote().then(() => $scope.status.waiting = false);
    $scope.$parent.changeCurrencySymbol($scope.transaction.currency);
    $scope.toggleEditAmount();
  };

  $scope.cancel = () => {
    $scope.tempCurrency = $scope.transaction.currency;
    $scope.tempFiat = $scope.transaction.fiat;
    $scope.$parent.fiatFormInvalid = false;
    $scope.toggleEditAmount();
  };

  $scope.changeTempCurrency = (curr) => (
    $scope.getMaxMin(curr).then(() => { $scope.tempCurrency = curr; })
  );

  $scope.setParentError = () => {
    $timeout(() => {
      $scope.$parent.fiatFormInvalid = $scope.tempFiatForm.$invalid && !$scope.needsKyc();
    });
  };

  let eventualError = (message) => Promise.reject.bind(Promise, { message });

  $scope.$parent.buy = () => {
    $scope.status.waiting = true;

    let success = (trade) => {
      $scope.$parent.trade = trade;
      Alerts.clear($scope.alerts);
      if ($scope.$parent.trade.bankAccount) $scope.formatTrade('bank_transfer');

      $scope.nextStep();
    };

    // check if bank transfer and kyc level
    if ($scope.needsKyc()) {
      return buySell.kycs.length && ['declined', 'rejected', 'expired'].indexOf(buySell.kycs[0].state) > -1
        ? buySell.triggerKYC().then(success, $scope.standardError)
        : buySell.getOpenKYC().then(success, $scope.standardError);
    }

    let buyError = eventualError('ERROR_TRADE_CREATE');

    $scope.accounts[0].buy()
                      .catch(buyError)
                      .then(success, $scope.standardError)
                      .then($scope.watchAddress);
  };

  $scope.$watch('transaction.currency', (newVal, oldVal) => {
    $scope.tempCurrency = $scope.transaction.currency;
  });

  $scope.$watch('transaction.fiat', (newVal, oldVal) => {
    $scope.tempFiat = $scope.transaction.fiat;
  });

  $scope.$watch('rateForm', () => {
    $scope.$parent.rateForm = $scope.rateForm;
  });

  $scope.$watch('step', () => {
    if ($scope.onStep('summary')) {
      $scope.getMaxMin($scope.tempCurrency);

      // Get a new quote if using a fake quote.
      if (!$scope.$parent.quote.id && !$scope.$parent.sell) {
        $scope.$parent.quote = null;
        $scope.getQuote();
      }
    }
  });
}
