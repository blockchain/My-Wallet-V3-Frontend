angular
  .module('walletApp')
  .controller('CoinifySellController', CoinifySellController);

function CoinifySellController ($scope, Wallet, Alerts, currency, $uibModalInstance, trade, buySellOptions, buySell, $q, $rootScope, country, accounts, $state, options, $stateParams, masterPaymentAccount) {
  $scope.fields = {};
  $scope.settings = Wallet.settings;
  $scope.currencies = currency.coinifySellCurrencies;
  $scope.user = Wallet.user;
  this.user = Wallet.user;
  $scope.trades = buySell.trades;
  $scope.alerts = [];
  this.trade = trade;
  $scope.isSweepTransaction = buySellOptions.isSweepTransaction;
  $scope.sepaCountries = country.sepaCountryCodes;
  $scope.bankAccounts = accounts;

  this.transaction = {
    btc: this.trade.btc,
    fiat: this.trade.fiat,
    currency: { name: 'Euro', code: 'EUR' },
    fee: { btc: null, fiat: null }
  };

  this.quote = trade.quote;
  this.totalBalance = currency.convertFromSatoshi(Wallet.my.wallet.balanceActiveAccounts, currency.bitCurrencies[0]);
  this.selectedBankAccount = null;
  if (masterPaymentAccount) this.paymentAccount = masterPaymentAccount;
  this.accounts = accounts;
  this.trade = trade;
  this.sepaCountries = country.sepaCountryCodes;

  console.log('coinify sell ctrl', this, masterPaymentAccount, accounts);

  $scope.assignFiatCurrency = () => {
    if (this.trade._state) return;
    if (this.trade.quote.quoteCurrency === 'BTC') {
      $scope.assignFiatHelper('baseCurrency');
    } else {
      $scope.assignFiatHelper('quoteCurrency');
    }
  };

  $scope.assignFiatHelper = (currencyType) => {
    this.transaction.currency.code = this.trade.quote[currencyType];
    this.transaction.currency.symbol = currency.conversions[this.trade.quote[currencyType]]['symbol'];
  };

  $scope.assignFiatCurrency();

  let exchange = buySell.getExchange();
  this.exchange = exchange && exchange.profile ? exchange : {profile: {}};
  this.exchangeCountry = exchange._profile._country || $stateParams.countryCode;
  this.fiat = () => this.transaction.currency.code;

  $scope.steps = {
    'email': 0,
    'accept-terms': 1,
    'account': 2,
    'bank-link': 3,
    'summary': 4,
    'review': 5,
    'isx': 6
  };
  this.onStep = (...steps) => steps.some(s => $scope.step === $scope.steps[s]);
  this.goTo = (step) => $scope.step = $scope.steps[step];

  $scope.nextStep = () => {
    if ((this.trade._state && !this.trade._iSignThisID) && this.exchange.profile) {
      this.sellTrade = this.trade;
      this.goTo('review');
      return;
    } else {
      if ((!this.user.isEmailVerified || this.rejectedEmail) && !this.exchange.user) {
        this.goTo('email');
      } else if (!this.exchange.user) {
        this.goTo('accept-terms');
      } else if (!this.accounts.length) {
        this.goTo('account');
      } else if (this.accounts.length) {
        this.goTo('bank-link');
      } else {
        this.goTo('summary');
      }
    }
  };

  $scope.fields = { email: $scope.user.email };

  this.goToOrderHistory = () => {
    if ((this.onStep('review') && $scope.sellTrade) && $state.params.selectedTab !== 'ORDER_HISTORY') {
      $state.go('wallet.common.buy-sell.coinify', {selectedTab: 'ORDER_HISTORY'});
    } else {
      $uibModalInstance.dismiss('');
    }
  };

  $scope.startPayment = () => {
    if (this.trade._state) return;
    const index = Wallet.getDefaultAccountIndex();
    $scope.payment = Wallet.my.wallet.createPayment();
    const tradeInSatoshi = currency.convertToSatoshi(this.transaction.btc, currency.bitCurrencies[0]);
    $scope.payment.from(index).amount(tradeInSatoshi);

    $scope.payment.sideEffect(result => {
      console.log('sideEffect', result);
      let firstBlockFee = result.absoluteFeeBounds[0];
      if ($scope.isSweepTransaction) {
        firstBlockFee = result.sweepFee;
      }
      $scope.payment.fee(firstBlockFee);
      this.transaction.fee.btc = currency.convertFromSatoshi(firstBlockFee, currency.bitCurrencies[0]);
      this.transaction.btcAfterFee = parseFloat((this.transaction.btc + this.transaction.fee.btc).toFixed(8));
    });
    return {transaction: this.transaction, payment: $scope.payment};
  };

  this.cancel = () => {
    $rootScope.$broadcast('fetchExchangeProfile');
    $uibModalInstance.dismiss('');
    $scope.reset();
    this.trade = null;
    buySell.getTrades().then(() => {
      this.goToOrderHistory();
    });
  };

  let links = options.partners.coinify.sellSurveyLinks;
  this.close = () => {
    let index;
    if (!this.exchange.user) index = 0;
    else if (this.onStep('account')) index = 1;
    else if (this.onStep('sell-summary')) index = 2;
    Alerts.surveyCloseConfirm('survey-opened', links, index, true).then($scope.cancel);
  };

  let startedPayment = $scope.startPayment();
  if (startedPayment) {
    this.transaction = Object.assign(this.transaction, startedPayment.transaction);
    this.payment = startedPayment.payment;
  }

  if (!$scope.step) {
    $scope.nextStep();
  }

  this.selectAccount = (account) => {
    this.selectedBankAccount = account;
    this.bankId = account.id;
  };

  this.onCreateBankSuccess = (bankId) => this.bankId = bankId;
  this.onSellSuccess = (trade) => this.sellTrade = trade;
  this.dismiss = () => $uibModalInstance.dismiss('');

  this.state = { email: { valid: true } };

  this.onEmailChange = (valid) => {
    this.state.email.valid = valid;
  };

  this.onSignupComplete = () => {
    this.quote.getPayoutMediums().then(mediums => {
      mediums.bank.getAccounts().then(accounts => {
        this.paymentAccount = accounts[0];
        return accounts[0];
      })
      .then(account => {
        account.getAll()
          .then(banks => {
            this.accounts = banks;
            this.goTo('account');
          });
      });
    });
  };

  $scope.standardError = (err) => {
    console.log(err);
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
    this.transaction.btc = null;
    this.transaction.fiat = null;
  };
}
