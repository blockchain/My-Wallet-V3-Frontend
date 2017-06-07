angular
  .module('walletApp')
  .controller('UnocoinBankTransferController', UnocoinBankTransferController);

let enumify = (...ns) => ns.reduce((e, n, i) => angular.merge(e, {[n]: i}), {});

function UnocoinBankTransferController (trade, bankAccount, formatTrade, $q, unocoin, modals) {
  this.formattedTrade = formatTrade.bankTransfer(trade, bankAccount);

  this.steps = enumify('summary', 'reference');
  this.onStep = (s) => this.steps[s] === this.step;
  this.goTo = (s) => this.step = this.steps[s];

  this.goTo('summary');
  this.state = { reference: '' };

  this.addReferenceNumber = () => {
    $q.resolve(trade.addReferenceNumber(this.state.reference))
      .then(this.$close)
      .then((trade) => modals.openTradeSummary(trade, 'initiated'))
      .catch((err) => { console.log(err); });
  };
}
