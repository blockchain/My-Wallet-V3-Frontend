angular
  .module('walletApp')
  .component('exchangeTrade', {
    bindings: {
      exTrade: '<'
    },
    templateUrl: 'templates/exchange/trade.pug',
    controller: ExchangeTradeController,
    controllerAs: '$ctrl'
  });

function ExchangeTradeController (Env, $scope, QA, $q, $timeout, Exchange, AngularHelper, ShapeShift) {
  Env.then(env => {
    this.buySellDebug = env.buySellDebug;
  });

  this.dateFormat = 'd MMMM yyyy, ' + 'HH:mm';
  this.dateFormat = $scope.$root.size.xs ? 'MMM d' : this.dateFormat;

  this.trade = this.exTrade;

  ShapeShift.shapeshift.updateTradeStatus(this.trade).then();
}
