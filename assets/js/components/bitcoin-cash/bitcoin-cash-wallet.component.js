angular
  .module('walletApp')
  .component('bitcoinCashWallet', {
    bindings: {
      shiftLoaded: '<',
      wallet: '<'
    },
    templateUrl: 'templates/bitcoin-cash/bitcoin-cash-wallet.pug',
    controller: bitcoinCashWalletController,
    controllerAs: '$ctrl'
  });

function bitcoinCashWalletController ($scope, modals, ShapeShift, MyWallet, Wallet, currency, Env) {
  this.accountInfo = MyWallet.wallet.accountInfo;

  Env.then(env => {
    let stateGuess = this.accountInfo.stateCodeGuess;
    let whitelistedStates = env.shapeshift.statesWhitelist;
    this.isInWhitelistedState = !stateGuess ? true : whitelistedStates.indexOf(stateGuess) > -1;
  });

  this.transactionViewOpen = false;
  this.toggleTransactionView = () => this.transactionViewOpen = !this.transactionViewOpen;
  this.balance = () => this.wallet.balance;
  this.bchCurrency = currency.bchCurrencies[0];
  this.fromSatoshi = currency.convertFromSatoshi;
  this.toSatoshi = currency.convertToSatoshi;

  this.showShift = () => ShapeShift.userHasAccess;

  this.openSend = () => modals.openSend(null, { code: 'bch', account: this.wallet });
  this.openExchange = () => modals.openExchange({ code: 'bch', account: this.wallet });

  let txs = () => Blockchain.MyWallet.wallet.bch.txs;
  this.txList = () => txs().filter((tx) => tx.belongsTo(this.wallet.index >= 0 ? this.wallet.index : 'imported'));

  this.trades = ShapeShift.shapeshift.trades;
  this.openTradeDetails = (trade) => modals.openShiftTradeDetails(trade);

  this.shiftTrades = [];
  this.loadShiftTrades = () => this.trades.filter(ss => {
    return this.txList().some(tx => tx.hash === ss.depositHash);
  });

  this.hasTransactions = () => this.shiftLoaded && this.txList().length > 0 || this.shiftTrades.length > 0;

  this.isDefault = (account) => Wallet.isDefaultAccount(account);

  $scope.$watch(() => this.shiftLoaded, (loaded) => {
    this.shiftTrades = loaded ? this.loadShiftTrades() : [];
  });
}
