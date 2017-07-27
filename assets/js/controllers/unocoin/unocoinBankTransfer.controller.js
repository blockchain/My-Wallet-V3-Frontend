angular
  .module('walletApp')
  .controller('UnocoinBankTransferController', UnocoinBankTransferController);

let enumify = (...ns) => ns.reduce((e, n, i) => angular.merge(e, {[n]: i}), {});

function UnocoinBankTransferController (trade, bankAccount, $uibModalInstance, formatTrade, $q, unocoin, modals, AngularHelper, Alerts, Env) {
  Env.then(env => {
    let links = env.partners.unocoin.surveyTradeLinks;

    this.close = () => {
      Alerts.surveyCloseConfirm('unocoin-trade-survey', links, this.step).then($uibModalInstance.dismiss);
    };
  });

  this.formattedTrade = formatTrade.bankTransfer(trade, bankAccount);

  this.steps = enumify('summary', 'reference', 'initiated');
  this.onStep = (s) => this.steps[s] === this.step;
  this.goTo = (s) => this.step = this.steps[s];

  this.goTo('summary');
  this.state = { reference: '' };

  this.addReferenceNumber = () => {
    this.lock();
    $q.resolve(trade.addReferenceNumber(this.state.reference))
      .then((trade) => {
        this.formattedTrade = formatTrade.initiated(trade);
      })
      .then(() => {
        this.goTo('initiated');
      })
      .catch((err) => { console.log(err); }).finally(this.free);
  };

  AngularHelper.installLock.call(this);
}
