angular
  .module('walletApp')
  .controller('CoinifySellController', CoinifySellController);

function CoinifySellController ($scope, $filter, $q, MyWallet, Wallet, MyWalletHelpers, Alerts, currency, $uibModalInstance, trade, buySellOptions, $timeout, $interval, formatTrade, buySell, $rootScope, $cookies, $window, country, accounts, $state, smartAccount, options, $stateParams) {
  $scope.fields = {};
  $scope.settings = Wallet.settings;
  $scope.btcCurrency = $scope.settings.btcCurrency;
  $scope.currencies = currency.coinifySellCurrencies;
  $scope.currencySymbol = null;
  $scope.user = Wallet.user;
  $scope.trades = buySell.trades;
  $scope.alerts = [];
  $scope.status = {};
  $scope.trade = trade;
  $scope.quote = buySellOptions.quote;
  $scope.isSell = buySellOptions.sell;
  $scope.isSweepTransaction = buySellOptions.isSweepTransaction;
  $scope.sepaCountries = country.sepaCountryCodes;
  $scope.acceptTermsForm;
  $scope.transaction = {};
  $scope.bankAccounts = accounts;
  $scope.totalBalance = Wallet.my.wallet.balanceActiveAccounts / 100000000;
  $scope.step;

  $scope.bankAccount = {
    account: {
      currency: null
    },
    bank: {
      name: null,
      address: {
        country: null,
        street: null, // required for UK
        city: null, // required for UK
        zipcode: null // required for UK
      }
    },
    holder: {
      name: null,
      address: {
        country: null,
        street: null,
        city: null,
        zipcode: null,
        state: null
      }
    }
  };

  $scope.transaction = {
    btc: $scope.trade.btc,
    fiat: $scope.trade.fiat,
    currency: { name: 'Euro', code: 'EUR' },
    fee: {
      btc: null,
      fiat: null
    }
  };

  $scope.assignFiatCurrency = () => {
    if ($scope.trade._state) return;
    if ($scope.trade.quote.quoteCurrency === 'BTC') {
      $scope.assignFiatHelper('baseCurrency');
    } else {
      $scope.assignFiatHelper('quoteCurrency');
    }
  };

  $scope.assignFiatHelper = (currencyType) => {
    $scope.transaction.currency = $scope.trade.quote[currencyType];
    $scope.bankAccount.account.currency = $scope.trade.quote[currencyType];
    $scope.currencySymbol = currency.conversions[$scope.trade.quote[currencyType]]['symbol'];
  };

  $scope.assignFiatCurrency();

  let exchange = buySell.getExchange();
  $scope.exchange = exchange && exchange.profile ? exchange : {profile: {}};
  $scope.exchangeCountry = exchange._profile._country || $stateParams.countryCode;

  $scope.setAccountCurrency = (countryCode) => {
    switch (countryCode) {
      case 'DK':
        $scope.bankAccount.account.currency = 'DKK';
        break;
      case 'GB':
        $scope.bankAccount.account.currency = 'GBP';
        break;
      default:
        $scope.bankAccount.account.currency = 'EUR';
        break;
    }
  };

  $scope.setAccountCurrency($scope.exchangeCountry);
  $scope.bankAccount.holder.address.country = $scope.exchangeCountry;

  $scope.dateFormat = 'd MMMM yyyy, HH:mm';
  $scope.isKYC = $scope.trade && $scope.trade.constructor.name === 'CoinifyKYC';
  $scope.needsISX = () => $scope.trade && !$scope.trade.bankAccount && buySell.tradeStateIn(buySell.states.pending)($scope.trade) || $scope.isKYC;
  $scope.needsReview = () => $scope.trade && buySell.tradeStateIn(buySell.states.pending)($scope.trade);

  $scope.steps = {
    'email': 0,
    'accept-terms': 1,
    'account-info': 2,
    'account-holder': 3,
    'bank-link': 4,
    'summary': 5,
    'review': 6,
    'isx': 7
  };

  $scope.onStep = (...steps) => steps.some(s => $scope.step === $scope.steps[s]);
  $scope.afterStep = (step) => $scope.step > $scope.steps[step];
  $scope.beforeStep = (step) => $scope.step < $scope.steps[step];
  $scope.currentStep = () => Object.keys($scope.steps).filter($scope.onStep)[0];

  $scope.goTo = (step) => $scope.step = $scope.steps[step];

  $scope.nextStep = () => {
    $scope.status = {};
    if ($scope.isKYC) {
      $scope.goTo('isx');
      return;
    }

    if (($scope.trade._state && !$scope.trade._iSignThisID) && $scope.user.isEmailVerified) {
      $scope.mapTradeDetails();
      $scope.goTo('review');
      return;
    } else {
      if (!$scope.user.isEmailVerified || $scope.rejectedEmail) {
        $scope.goTo('email');
      } else if (!$scope.exchange.user) {
        $scope.goTo('accept-terms');
      } else if (!$scope.bankAccounts || !$scope.bankAccounts.length) {
        $scope.goTo('account-info');
      } else if ($scope.bankAccounts) {
        $scope.goTo('bank-link');
      } else {
        $scope.goTo('summary');
      }
    }
  };

  $scope.isDisabled = () => {
    const b = $scope.bankAccount;
    if ($scope.onStep('accept-terms')) {
      return !$scope.fields.acceptTOS;
    } else if ($scope.onStep('email')) {
      return !$scope.user.isEmailVerified;
    } else if ($scope.onStep('account-info')) {
      return (!b.account.number || !b.account.bic);
    } else if ($scope.onStep('account-holder')) {
      return (!b.holder.name || !b.holder.address.street || !b.holder.address.zipcode || !b.holder.address.city || !b.holder.address.country);
    } else if ($scope.onStep('bank-link')) {
      return !$scope.selectedBankAccount;
    } else if ($scope.onStep('summary')) {
      if ($scope.sellRateForm) {
        if ($scope.insufficientFunds() === true || !$scope.sellRateForm.$valid) {
          return true;
        }
      }
      if ($scope.trade) {
        if (!$scope.trade.quote) true;
      }
    }
  };

  $scope.insufficientFunds = () => {
    const tx = $scope.transaction;
    const combined = tx.btc + tx.fee.btc;
    if (combined > $scope.totalBalance) {
      return true;
    }
  };

  $scope.fields = { email: $scope.user.email };

  const handleAccountCreateError = (e) => {
    let accountError = JSON.parse(e);
    Alerts.displayError(accountError.error_description);
    $scope.status = {};
    if (accountError.error === 'invalid_iban') $scope.ibanError = true;
    $scope.goTo('account-info');
  };

  const handleAfterAccountCreate = (d) => {
    if (!d) {
      Alerts.displayError('BANK_ACCOUNT_CREATION_FAILED');
      $scope.goTo('account-info');
    } else {
      $scope.goTo('summary');
    }
  };

  $scope.createBankAccount = () => {
    $scope.status.waiting = true;
    $scope.bankAccount.account.currency = $scope.transaction.currency;
    $q.resolve(buySell.createBankAccount($scope.bankAccount))
      .then((result) => {
        $scope.selectedBankAccount = result;
        $scope.status = {};
        return result;
      })
      .then(data => handleAfterAccountCreate(data))
      .catch(e => handleAccountCreateError(e));
  };

  const handleGetBankAccounts = (result) => {
    if (result) {
      $scope.registeredBankAccount = true;
      $scope.bankAccounts = result;
      return result;
    } else {
      $scope.registeredBankAccount = false;
      $scope.bankAccounts = null;
    }
  };

  $scope.getBankAccounts = () => {
    $q.resolve(buySell.getBankAccounts())
      .then(result => handleGetBankAccounts(result))
      .catch(e => console.log('error in getBankAccounts', e));
  };

  $scope.goToOrderHistory = () => {
    if ($scope.onStep('accept-terms') || $scope.onStep('trade-formatted') || !$scope.trades.pending.length || $state.params.selectedTab === 'ORDER_HISTORY') {
      $uibModalInstance.dismiss('');
    } else {
      $state.go('wallet.common.buy-sell.coinify', {selectedTab: 'ORDER_HISTORY'});
    }
  };

  // NOTE this gets run upon controller load
  $scope.startPayment = () => {
    if ($scope.trade._state) return;

    const index = Wallet.getDefaultAccountIndex();
    $scope.payment = Wallet.my.wallet.createPayment();
    const tradeInSatoshi = currency.convertToSatoshi($scope.trade.btc, currency.bitCurrencies[0]);
    $scope.payment.from(index).amount(tradeInSatoshi);

    $scope.payment.sideEffect(result => {
      let firstBlockFee = result.absoluteFeeBounds[0];
      if ($scope.isSweepTransaction) {
        firstBlockFee = result.sweepFee;
      }
      $scope.payment.fee(firstBlockFee);
      $scope.transaction.fee.btc = currency.convertFromSatoshi(firstBlockFee, currency.bitCurrencies[0]);
      const amountAfterFee = $scope.transaction.btc + $scope.transaction.fee.btc;
      $scope.transaction.btcAfterFee = parseFloat(amountAfterFee.toFixed(8));
      $scope.payment.amount(amountAfterFee / 100000000); // in SATOSHI
    });
  };

  $scope.cancel = () => {
    $rootScope.$broadcast('fetchExchangeProfile');
    $uibModalInstance.dismiss('');
    $scope.reset();
    $scope.trade = null;
    buySell.getTrades().then(() => {
      $scope.goToOrderHistory();
    });
  };

  let links = options.partners.coinify.sellSurveyLinks;
  $scope.close = () => {
    let index;
    if (!$scope.exchange.user) index = 0;
    else if ($scope.onStep('account-info') || $scope.onStep('account-holder')) index = 1;
    else if ($scope.onStep('summary')) index = 2;
    Alerts.surveyCloseConfirm('survey-opened', links, index, true).then($scope.cancel);
  };

  $scope.dismiss = () => {
    $uibModalInstance.dismiss('');
  };

  $scope.mapTradeDetails = () => {
    const t = $scope.trade;
    $scope.sellTrade = {
      id: t._id,
      createTime: t.createdAt,
      transferIn: {receiveAmount: t._inAmount / 100000000},
      transferOut: {receiveAmount: t.outAmountExpected / 100, currency: t._outCurrency},
      bankDigits: t._lastSixBankAccountDigits
    };
    $scope.tradeCompleted = $scope.isInCompletedState(t);
    $scope.inNegativeState = $scope.isInNegativeState(t);
    $scope.formatBankInfo(t);
  };

  const transactionFailed = (message) => {
    let msgText = typeof message === 'string' ? message : 'SEND_FAILED';
    if (msgText.indexOf('Fee is too low') > -1) msgText = 'LOW_FEE_ERROR';

    if (msgText.indexOf('Transaction Already Exists') > -1) {
      $uibModalInstance.close();
    } else {
      Alerts.displayError(msgText, false, $scope.alerts);
    }
  };

  const transactionSucceeded = (tx) => {
    $timeout(() => {
      Wallet.beep();
      let message = 'BITCOIN_SENT';
      Alerts.displaySentBitcoin(message);
      let note = `Coinify Sell Order ${$scope.sellTrade.id}`;
      if (note !== '') Wallet.setNote({ hash: tx.txid }, note);
    }, 500);
  };

  const setCheckpoint = (payment) => {
    $scope.paymentCheckpoint = payment;
  };

  const signAndPublish = (passphrase) => {
    return $scope.payment.sideEffect(setCheckpoint)
      .sign(passphrase).publish().payment;
  };

  const handleSellResult = (sellResult) => {
    if (!sellResult.transferIn) {
      $scope.error = sellResult;
      $scope.error = JSON.parse($scope.error);
    } else {
      $scope.sellTrade = sellResult;
      $scope.sendAddress = sellResult.transferIn.details.account;
      $scope.sendAmount = sellResult.transferIn.sendAmount * 100000000;
      $scope.formatBankInfo(sellResult);
    }
  };

  const handlePaymentAssignment = () => {
    $scope.payment.to($scope.sendAddress);
    $scope.payment.amount($scope.sendAmount);
    // $scope.payment.build();
  };

  $scope.sell = () => {
    $scope.status.waiting = true;
    $q.resolve(buySell.createSellTrade($scope.trade.quote, $scope.selectedBankAccount))
      .then(sellResult => {
        console.log('sell created - result:', sellResult);
        handleSellResult(sellResult);
        return sellResult;
      })
      .then(sellData => {
        handlePaymentAssignment();
        // for testing
        if (exchange._customAddress && exchange._customAmount) {
          console.log('customAddress and customAmount', exchange._customAddress, exchange._customAmount);
          $scope.payment.to(exchange._customAddress);
          $scope.payment.amount(exchange._customAmount);
        }
        $scope.payment.build();

        // NOTE sending is turned off when below is commented out
        Wallet.askForSecondPasswordIfNeeded()
          .then(signAndPublish)
          .then(transactionSucceeded)
          .catch(err => {
            console.log('err when publishing', err);
            transactionFailed(err);
          });
      })
      .catch((e) => console.log(e))
      .finally(() => {
        $scope.status.waiting = false;
        if (!$scope.error) $scope.goTo('review');
      });
  };

  // TODO this whole thing needs to be refactored (or killed)
  $scope.formatBankInfo = (trade) => {
    if (trade.transferOut) {
      let n = trade.transferOut.details.account.number;
      $scope.bankNameOrNumber = n.substring(n.length, n.length - 6);
    }
  };

  $scope.isInCompletedState = (trade) => {
    if (trade._state === 'awaiting_transfer_in' || trade._state === 'processing') {
      return false;
    } else {
      return true;
    }
  };

  $scope.isInNegativeState = (trade) => {
    if (trade._state === 'canceled' || trade._state === 'expired' || trade._state === 'rejected') {
      return true;
    }
  };

  $scope.finishISX = (state) => {
    console.log('finishISX', state);
    $scope.ISXState = state;
    switch (state) {
      case 'reviewing':
        $scope.KYCState = 'TX_KYC_REVIEWING.BODY';
        $scope.goTo('review');
        break;
      case 'processing':
        $scope.KYCState = 'SELL.KYC_SUCCESS';
        $scope.goTo('review');
        break;
      case 'cancelled':
        $scope.KYCState = 'SELL.KYC_CANCELLED';
        $scope.goTo('review');
        break;
      case 'expired':
        $scope.KYCState = 'SELL.KYC_EXPIRED';
        $scope.goTo('review');
        break;
      case 'rejected':
        $scope.KYCState = 'SELL.KYC_REJECTETED';
        $scope.goTo('review');
        break;
    }
    // TODO screens for ISX status
    $scope.goTo('review');
  };

  $scope.startPayment();
  if (!$scope.step) {
    $scope.nextStep();
  }

  console.log('coinifySell controller', $scope);

  $scope.standardError = (err) => {
    console.log(err);
    $scope.status = {};
    try {
      let e = JSON.parse(err);
      let msg = e.error.toUpperCase();
      if (msg === 'EMAIL_ADDRESS_IN_USE') $scope.rejectedEmail = true;
      else Alerts.displayError(msg, true, $scope.alerts, {user: $scope.exchange.user});
    } catch (e) {
      let msg = e.error || err.message;
      if (msg) Alerts.displayError(msg, true, $scope.alerts);
      else Alerts.displayError('INVALID_REQUEST', true, $scope.alerts);
    }
  };

  $scope.reset = () => {
    $scope.transaction.btc = null;
    $scope.transaction.fiat = null;
  };

  $scope.$watch('user.isEmailVerified', () => $scope.onStep('email') && $scope.nextStep());
  $scope.$watch('currencySymbol', (newVal, oldVal) => {
    if (!$scope.currencySymbol) {
      let curr = $scope.transaction.currency || null;
      $scope.currencySymbol = currency.conversions[curr.code];
    }
    if (!newVal) return;
  });
}
