angular
  .module('walletApp')
  .controller('CoinifySellController', CoinifySellController);

function CoinifySellController ($scope, $filter, $q, MyWallet, Wallet, MyWalletHelpers, Alerts, currency, $uibModalInstance, trade, buySellOptions, $timeout, $interval, formatTrade, buySell, $rootScope, $cookies, $window, country, accounts, $state, smartAccount, options, $stateParams) {
  $scope.fields = {};
  $scope.settings = Wallet.settings;
  $scope.btcCurrency = $scope.settings.btcCurrency;
  $scope.currencies = currency.coinifySellCurrencies;
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
  $scope.bankAccounts = accounts;
  $scope.totalBalance = Wallet.my.wallet.balanceActiveAccounts / 100000000;

  $scope.transaction = {
    btc: $scope.trade.btc,
    fiat: $scope.trade.fiat,
    currency: { name: 'Euro', code: 'EUR' },
    fee: {
      btc: null,
      fiat: null
    }
  };
  this.totalBalance = Wallet.my.wallet.balanceActiveAccounts / 100000000;
  this.selectedBankAccount = null;
  this.accounts = accounts;
  this.trade = trade;
  this.sepaCountries = country.sepaCountryCodes;
  this.isSweepTransaction = buySellOptions.isSweepTransaction;

  $scope.bankAccount = {
    account: { currency: null },
    bank: { name: null, address: { country: null, street: null, city: null, zipcode: null } },
    holder: { name: null, address: { country: null, street: null, city: null, zipcode: null, state: null } }
  };
  this.bankAccount = {
    account: { currency: null },
    bank: { name: null, address: { country: null, street: null, city: null, zipcode: null } },
    holder: { name: null, address: { country: null, street: null, city: null, zipcode: null, state: null } }
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
    this.bankAccount.account.currency = $scope.trade.quote[currencyType];
    $scope.currencySymbol = currency.conversions[$scope.trade.quote[currencyType]]['symbol'];
  };

  $scope.assignFiatCurrency();

  let exchange = buySell.getExchange();
  $scope.exchange = exchange && exchange.profile ? exchange : {profile: {}};
  $scope.exchangeCountry = exchange._profile._country || $stateParams.countryCode;
  this.exchangeCountry = exchange._profile._country || $stateParams.countryCode;
  this.bankAccount.bank.address.country = this.exchangeCountry;
  $scope.bankAccount.bank.address.country = this.exchangeCountry;
  this.holderCountry = this.exchangeCountry;

  $scope.setAccountCurrency = (countryCode) => {
    switch (countryCode) {
      case 'DK':
        $scope.bankAccount.account.currency = 'DKK';
        this.bankAccount.account.currency = 'DKK';
        break;
      case 'GB':
        $scope.bankAccount.account.currency = 'GBP';
        this.bankAccount.account.currency = 'GBP';
        break;
      default:
        $scope.bankAccount.account.currency = 'EUR';
        this.bankAccount.account.currency = 'EUR';
        break;
    }
  };

  $scope.setAccountCurrency($scope.exchangeCountry);
  $scope.bankAccount.holder.address.country = $scope.exchangeCountry.code;

  console.log('scope.trade and scope.tx', $scope.trade, $scope.transaction)

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

  this.goTo = (step) => $scope.step = $scope.steps[step];
  $scope.goTo = (step) => $scope.step = $scope.steps[step];

  $scope.nextStep = () => {
    $scope.status = {};
    if ($scope.isKYC) {
      this.goTo('isx');
      return;
    }

    if (($scope.trade._state && !$scope.trade._iSignThisID) && $scope.user.isEmailVerified) {
      $scope.mapTradeDetails();
      this.goTo('review');
      return;
    } else {
      if (!$scope.user.isEmailVerified || $scope.rejectedEmail) {
        this.goTo('email');
      } else if (!$scope.exchange.user) {
        this.goTo('accept-terms');
      } else if (!$scope.bankAccounts || !$scope.bankAccounts.length) {
        this.goTo('account-info');
      } else if ($scope.bankAccounts) {
        this.goTo('bank-link');
      } else {
        this.goTo('summary');
      }
    }
  };

  this.isDisabled = () => {
    const b = $scope.bankAccount;
    if ($scope.onStep('accept-terms')) {
      return !$scope.fields.acceptTOS;
    } else if ($scope.onStep('email')) {
      return !$scope.user.isEmailVerified;
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

  $scope.fields = { email: $scope.user.email };

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
      .then(handleGetBankAccounts)
      .catch(e => console.log('error in getBankAccounts', e));
  };

  this.goToOrderHistory = () => {
    if (($scope.onStep('review') && $scope.sellTrade) && $state.params.selectedTab !== 'ORDER_HISTORY') {
      $state.go('wallet.common.buy-sell.coinify', {selectedTab: 'ORDER_HISTORY'});
    } else {
      $uibModalInstance.dismiss('');
    }
  };

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
    return {transaction: $scope.transaction, payment: $scope.payment};
  };

  $scope.cancel = () => {
    $rootScope.$broadcast('fetchExchangeProfile');
    $uibModalInstance.dismiss('');
    $scope.reset();
    $scope.trade = null;
    buySell.getTrades().then(() => {
      this.goToOrderHistory();
    });
  };

  let links = options.partners.coinify.sellSurveyLinks;
  this.close = () => {
    let index;
    if (!$scope.exchange.user) index = 0;
    else if ($scope.onStep('account-info') || $scope.onStep('account-holder')) index = 1;
    else if ($scope.onStep('summary')) index = 2;
    Alerts.surveyCloseConfirm('survey-opened', links, index, true).then($scope.cancel);
  };

  this.dismiss = () => {
    $uibModalInstance.dismiss('');
  };

  $scope.mapTradeDetails = () => {
    const t = $scope.trade;
    $scope.sellTrade = {
      id: t._id,
      createTime: t.createdAt,
      transferIn: {receiveAmount: t._inAmount / 100000000},
      transferOut: {receiveAmount: t.outAmountExpected / 100, currency: t._outCurrency},
      bankDigits: t._bankAccountNumber
    };
    $scope.tradeCompleted = $scope.isInCompletedState(t);
    $scope.inNegativeState = $scope.isInNegativeState(t);
    $scope.formatBankInfo(t);
  };

  $scope.formatBankInfo = (trade) => {
    if (trade.transferOut) {
      let n = trade.transferOut.details.account.number;
      $scope.bankNameOrNumber = n;
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

  let startedPayment = $scope.startPayment();
  this.transaction = startedPayment.transaction;
  this.payment = startedPayment.payment;

  if (!$scope.step) {
    $scope.nextStep();
  }

  this.selectAccount = (account) => {
    this.selectedBankAccount = account;
    this.bankId = account.id;
  };

  this.buildBankAccount = (data) => {
    this.bankAccount.account = Object.assign(this.bankAccount.account, data);
    $scope.bankAccount.account = Object.assign($scope.bankAccount.account, data);
  };

  this.buildBankHolder = (data) => {
    this.bankAccount.holder = Object.assign(this.bankAccount.holder, data);
    $scope.bankAccount.holder = Object.assign($scope.bankAccount.holder, data);
  };

  this.changeHolderCountry = (country) => {
    this.bankAccount.holder.address.country = country;
    $scope.bankAccount.holder.address.country = country;
    this.holderCountry = country;
  };

  this.onCreateBankSuccess = (bankId) => this.bankId = bankId;

  this.setIbanError = () => {
    this.ibanError = true;
    this.goTo('account-info');
  };

  this.onSellSuccess = (trade) => {
    console.log('onSellSuccess', trade);
    this.sellTrade = trade;
  }

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
