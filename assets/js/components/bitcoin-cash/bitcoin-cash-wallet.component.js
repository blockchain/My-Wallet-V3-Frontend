angular
  .module('walletApp')
  .component('bitcoinCashWallet', {
    bindings: {
      wallet: '<'
    },
    templateUrl: 'templates/bitcoin-cash/bitcoin-cash-wallet.pug',
    controller: bitcoinCashWalletController,
    controllerAs: '$ctrl'
  });

function bitcoinCashWalletController (modals, ShapeShift, MyWallet, Wallet, currency, Env) {
  this.accountInfo = MyWallet.wallet.accountInfo;

  Env.then(env => {
    let stateGuess = this.accountInfo.stateCodeGuess;
    let whitelistedStates = env.shapeshift.statesWhitelist;
    this.isInWhitelistedState = !stateGuess ? true : whitelistedStates.indexOf(stateGuess) > -1;
  });

  this.transactionViewOpen = false;
  this.toggleTransactionView = () => this.transactionViewOpen = !this.transactionViewOpen;
  this.balance = () => this.wallet.balance / 1e8;
  this.bchCurrency = currency.bchCurrencies[0];
  this.toSatoshi = currency.convertToSatoshi;

  this.showShift = () => ShapeShift.userHasAccess;

  this.openSend = () => modals.openSend(null, { code: 'bch', index: this.wallet.index });
  this.openExchange = () => modals.openExchange({ code: 'bch', index: this.wallet.index });

  let txs = Blockchain.MyWallet.wallet.bch.txs;
  this.txList = () => txs.filter((tx) => tx.belongsTo(this.wallet.index));

  this.trades = ShapeShift.shapeshift.trades;
  this.openTradeDetails = (trade) => modals.openShiftTradeDetails(trade);

  this.shiftTrades = this.trades.filter(ss => {
    return this.txList().some(tx => tx.hash === ss.depositHash);
  });

  this.hasTransactions = () => this.txList().length > 0 || this.shiftTrades.length > 0;
  console.log('bitcoin cash wallet', this.balance(), this.hasTransactions(), this.txList());
}
