angular
  .module('walletApp')
  .controller('ShapeShiftCheckoutController', ShapeShiftCheckoutController);

function ShapeShiftCheckoutController ($scope, $stateParams, ShapeShift, modals, AngularHelper, MyWallet, Wallet, Ethereum, BitcoinCash, state, Env) {
  let enumify = (...ns) => ns.reduce((e, n, i) => angular.merge(e, {[n]: i}), {});

  this.destination = $stateParams.destination || null;
  this.tabs = {
    selectedTab: $stateParams.selectedTab || 'EXCHANGE',
    options: ['EXCHANGE', 'ORDER_HISTORY'],
    select (tab) { this.selectedTab = this.selectedTab ? tab : null; }
  };

  this.orderHistoryCurrencies = ['btc', 'eth', 'bch'];
  this.human = {'BTC': 'bitcoin', 'ETH': 'ether', 'BCH': 'bitcoin cash'};
  this.steps = enumify('state-select', 'create', 'confirm', 'receipt');
  this.onStep = (s) => this.steps[s] === this.step;
  this.goTo = (s) => this.step = this.steps[s];
  this.wallets = Wallet.accounts().filter(a => !a.archived).concat(BitcoinCash.accounts.filter((a) => !a.archived)).concat(Ethereum.defaultAccount);

  if (Wallet.accounts().length < 2) {
    this.wallets = this.wallets.map(w => {
      if (w.coinCode === 'btc') w.altLabel = 'Bitcoin';
      if (w.coinCode === 'eth') w.altLabel = 'Ether';
      if (w.coinCode === 'bch') w.altLabel = 'Bitcoin Cash';
      return w;
    });
  }

  this.trades = () => ShapeShift.shapeshift.trades.filter((t) => t.pair && this.orderHistoryCurrencies.indexOf(t.fromCurrency.toLowerCase()) > -1);
  this.completedTrades = () => this.trades().some(t => t.isComplete || t.isFailed || t.isResolved);
  this.pendingTrades = () => this.trades().some(t => t.isProcessing || t.isWaitingForDeposit);
  this.openTradeDetails = (trade) => modals.openShiftTradeDetails(trade);

  let accountInfo = MyWallet.wallet.accountInfo;
  let codeGuess = accountInfo && accountInfo.countryCodeGuess;
  let storedState = ShapeShift.USAState;

  if (codeGuess === 'US' && !storedState) {
    this.states = state.stateCodes;
    this.goTo('state-select');
  } else {
    this.goTo('create');
  }
}
