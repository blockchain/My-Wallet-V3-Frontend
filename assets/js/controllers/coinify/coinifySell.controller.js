angular
  .module('walletApp')
  .controller('CoinifySellController', CoinifySellController);

function CoinifySellController ($scope, Wallet, Alerts, Env, currency, $uibModalInstance, $q, $rootScope, accounts, $state, $stateParams, quote, trade, coinify, Exchange) {
  Env.then(env => this.qaDebugger = env.qaDebugger);

  $scope.fields = {};
  $scope.user = Wallet.user;

  this.trade = trade;
  this.quote = quote;
  this.user = Wallet.user;
  this.accounts = accounts;
  this.selectedBankAccount = null;
  this.now = () => new Date().getTime();
  this.timeToExpiration = () => this.quote ? this.quote.expiresAt - this.now() : '';

  this.baseFiat = () => !currency.isBitCurrency({code: this.quote.baseCurrency});
  this.fiatCurrency = () => this.baseFiat() ? this.quote.baseCurrency : this.quote.quoteCurrency;
  this.BTCAmount = () => !this.baseFiat() ? Math.abs(this.quote.baseAmount) : Math.abs(this.quote.quoteAmount);
  this.fiatAmount = () => this.baseFiat() ? Math.abs(this.quote.baseAmount) : Math.abs(this.quote.quoteAmount);
  this.totalBalance = currency.convertFromSatoshi(Wallet.my.wallet.balanceActiveAccounts, currency.bitCurrencies[0]);
  this.refreshQuote = () => $q.resolve(coinify.getSellQuote(this.BTCAmount(), 'BTC', this.fiatCurrency()).then(onRefreshQuote));

  const onRefreshQuote = (quote) => {
    this.quote = quote;
    this.selectedBankAccount && this.selectedBankAccount.updateQuote(quote);
  };

  this.steps = {
    'email': 0,
    'accept-terms': 1,
    'account': 2,
    'bank-link': 3,
    'summary': 4,
    'trade-complete': 5,
    'isx': 6
  };
  this.onStep = (...steps) => steps.some(s => this.step === this.steps[s]);
  this.goTo = (step) => {
    this.step = this.steps[step];
    this.setTitle(step);
  };
  this.setTitle = (step) => {
    switch (step) {
      case 'account':
        this.title = 'SELL.ADD_BANK_ACCOUNT';
        break;
      case 'bank-link':
        this.title = 'SELL.LINKED_ACCOUNTS';
        break;
      case 'summary':
        this.title = 'SELL.CONFIRM_SELL_ORDER';
        break;
      case 'trade-complete':
        this.title = 'SELL.SELL_BITCOIN';
        this.hide = true;
        break;
      default:
        this.title = 'SELL.SELL_BITCOIN';
        break;
    }
  };

  this.nextStep = () => {
    if (this.isKYC) {
      this.goTo('isx');
      return;
    }
    if ((this.trade && !this.trade.iSignThisID) && this.exchange.profile) {
      this.sellTrade = this.trade;
      this.goTo('trade-complete');
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

  this.getQuoteHelper = () => {
    if (this.quote && !this.quote.id) return 'EST_QUOTE_1';
    else return 'SELL.QUOTE_WILL_EXPIRE';
  };

  let exchange = coinify.exchange;
  this.exchange = exchange && exchange.profile ? exchange : {profile: {}};
  this.country = exchange.user ? exchange.profile.country : $stateParams.countryCode;

  $scope.fields = { email: $scope.user.email };

  this.goToOrderHistory = () => {
    if ((this.onStep('trade-complete')) && $state.params.selectedTab !== 'ORDER_HISTORY') {
      $state.go('wallet.common.buy-sell.coinify', {selectedTab: 'ORDER_HISTORY'});
    } else {
      $uibModalInstance.dismiss('');
    }
  };

  this.cancel = () => {
    this.trade = null;
    $uibModalInstance.dismiss('');
    coinify.exchange.user && Exchange.fetchExchangeData(coinify.exchange);
  };

  let links;

  Env.then(env => {
    links = env.partners.coinify.sellSurveyLinks;
  });

  this.close = () => {
    let index;
    if (!this.exchange.user) index = 0;
    else if (this.onStep('account')) index = 1;
    else if (this.onStep('summary')) index = 2;
    Alerts.surveyCloseConfirm('sell-survey-opened', links, index).then(this.cancel);
  };

  if (!this.step) this.nextStep();

  this.selectAccount = (bank) => {
    this.selectedBankAccount = bank;
  };

  this.onSellSuccess = (trade) => this.sellTrade = trade;
  this.dismiss = () => $uibModalInstance.dismiss('');

  this.state = { email: { valid: true } };

  this.onEmailChange = (valid) => {
    this.state.email.valid = valid;
  };

  this.onSignupComplete = () => {
    Exchange.fetchProfile(coinify.exchange)
      .then(() => this.refreshQuote())
      .then(() => this.quote.getPaymentMediums())
      .then((mediums) => {
        mediums.bank.getBankAccounts().then(bankAccounts => {
          this.accounts = bankAccounts;
          this.goTo('account');
        });
      });
  };

  const handleError = (e) => {
    let accountError = JSON.parse(e);
    Alerts.displayError(accountError.error_description);
    if (accountError.error === 'invalid_iban') {
      this.ibanError = true;
    }
  };

  this.onCreateBankSuccess = (bank) => {
    this.selectedBankAccount = bank;
    this.goTo('summary');
  };

  this.addBankAccount = (bankObj, userObj) => {
    this.ibanError = false;
    let holder = { holder: {} };
    Object.assign(holder.holder, userObj);
    let obj = Object.assign(bankObj, holder);
    obj.account.currency = this.fiatCurrency();
    $q.resolve(this.quote.paymentMediums.bank.addBankAccount(obj))
      .then(this.onCreateBankSuccess)
      .catch(handleError);
  };

  if (!this.sellLimits) this.sellLimits = coinify.getSellLimits;
}
