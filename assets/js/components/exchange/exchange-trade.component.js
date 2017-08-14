angular
  .module('walletApp')
  .component('exchangeTrade', {
    bindings: {
      exTrade: '<',
      viewDetails: '&'
    },
    templateUrl: 'templates/exchange/trade.pug',
    controller: ExchangeTradeController,
    controllerAs: '$ctrl'
  });

function ExchangeTradeController ($scope, Env, Exchange, AngularHelper, ShapeShift) {
  this.dateFormat = 'd MMMM yyyy, ' + 'HH:mm';
  this.dateFormat = $scope.$root.size.xs ? 'MMM d' : this.dateFormat;

  this.trade = this.exTrade;
  this.getClass = (trade) => {
    if (this.trade.isFailed || this.trade.isResolved) return 'state-danger-text';
    else if (this.trade.isComplete) return 'success';
    else if (this.trade.isWaitingForDeposit || this.trade.isProcessing) return 'medium-blue';
  };
}
