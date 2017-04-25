angular
  .module('walletApp')
  .controller('CoinifySellController', CoinifySellController);

function CoinifySellController ($scope, Wallet, Alerts, currency, $uibModalInstance, trade, buySellOptions, buySell, $rootScope, country, accounts, $state, options, $stateParams, masterPaymentAccount) {
  $scope.fields = {};
  $scope.settings = Wallet.settings;
  $scope.btcCurrency = $scope.settings.btcCurrency;
  $scope.currencies = currency.coinifySellCurrencies;
  $scope.user = Wallet.user;
  $scope.trades = buySell.trades;
  $scope.alerts = [];
  $scope.status = {};
  $scope.trade = trade;
  $scope.isSweepTransaction = buySellOptions.isSweepTransaction;
  $scope.sepaCountries = country.sepaCountryCodes;
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
  this.masterAccount = masterPaymentAccount;
  this.accounts = accounts;
  this.trade = trade;
  this.sepaCountries = country.sepaCountryCodes;
  this.isSweepTransaction = buySellOptions.isSweepTransaction;
  if (accounts) this.paymentAccount = accounts.accounts[0];

  console.log('coinify sell ctrl this', this);

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
    this.bankAccount.account.currency = $scope.trade.quote[currencyType];
    $scope.currencySymbol = currency.conversions[$scope.trade.quote[currencyType]]['symbol'];
  };

  $scope.assignFiatCurrency();

  let exchange = buySell.getExchange();
  this.exchange = exchange && exchange.profile ? exchange : {profile: {}};
  this.exchangeCountry = exchange._profile._country || $stateParams.countryCode;
  this.bankAccount.bank.address.country = this.exchangeCountry;
  this.holderCountry = this.exchangeCountry;

  $scope.setAccountCurrency = (countryCode) => {
    switch (countryCode) {
      case 'DK':
        this.bankAccount.account.currency = 'DKK';
        break;
      case 'GB':
        this.bankAccount.account.currency = 'GBP';
        break;
      default:
        this.bankAccount.account.currency = 'EUR';
        break;
    }
  };

  $scope.setAccountCurrency(this.exchangeCountry);
  this.bankAccount.holder.address.country = this.exchangeCountry.code;

  console.log('scope.trade and scope.tx', $scope.trade, $scope.transaction);

  $scope.dateFormat = 'd MMMM yyyy, HH:mm';
  $scope.isKYC = $scope.trade && $scope.trade.constructor.name === 'CoinifyKYC';

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
  this.goTo = (step) => $scope.step = $scope.steps[step];

  $scope.nextStep = () => {
    $scope.status = {};
    if ($scope.isKYC) {
      this.goTo('isx');
      return;
    }

    if ((this.trade._state && !this.trade._iSignThisID) && this.exchange.profile) {
      this.goTo('review');
      return;
    } else {
      if ((!$scope.user.isEmailVerified || $scope.rejectedEmail) && !this.exchange.user) {
        this.goTo('email');
      } else if (!this.exchange.user) {
        this.goTo('accept-terms');
      } else if (!this.accounts) {
        this.goTo('account-info');
      } else if (this.accounts) {
        this.goTo('bank-link');
      } else {
        this.goTo('summary');
      }
    }
  };

  $scope.fields = { email: $scope.user.email };

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
      console.log('sideEffect', $scope.transaction);
      let firstBlockFee = result.absoluteFeeBounds[0];
      if ($scope.isSweepTransaction) {
        firstBlockFee = result.sweepFee;
      }
      $scope.payment.fee(firstBlockFee);
      $scope.transaction.fee.btc = currency.convertFromSatoshi(firstBlockFee, currency.bitCurrencies[0]);
      $scope.transaction.btcAfterFee = parseFloat(($scope.transaction.btc + $scope.transaction.fee.btc).toFixed(8));
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
    if (!this.exchange.user) index = 0;
    else if ($scope.onStep('account-info') || $scope.onStep('account-holder')) index = 1;
    else if ($scope.onStep('summary')) index = 2;
    Alerts.surveyCloseConfirm('survey-opened', links, index, true).then($scope.cancel);
  };

  this.dismiss = () => {
    $uibModalInstance.dismiss('');
  };

  let startedPayment = $scope.startPayment();
  if (startedPayment) {
    this.transaction = startedPayment.transaction;
    this.payment = startedPayment.payment;
  }

  if (!$scope.step) {
    $scope.nextStep();
  }

  this.selectAccount = (account) => {
    this.selectedBankAccount = account;
    this.bankId = account.id;
  };

  this.buildBankAccount = (data) => {
    this.bankAccount.account = Object.assign(this.bankAccount.account, data);
  };

  this.buildBankHolder = (data) => {
    this.bankAccount.holder = Object.assign(this.bankAccount.holder, data);
  };

  this.changeHolderCountry = (country) => {
    this.bankAccount.holder.address.country = country;
    this.holderCountry = country;
  };

  this.onCreateBankSuccess = (bankId) => this.bankId = bankId;

  this.setIbanError = () => {
    this.ibanError = true;
    this.goTo('account-info');
  };

  this.onSellSuccess = (trade) => {
    this.completedTrade = trade;
  };

  $scope.standardError = (err) => {
    console.log(err);
    $scope.status = {};
    try {
      let e = JSON.parse(err);
      let msg = e.error.toUpperCase();
      if (msg === 'EMAIL_ADDRESS_IN_USE') $scope.rejectedEmail = true;
      else Alerts.displayError(msg, true, $scope.alerts, {user: this.exchange.user});
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
