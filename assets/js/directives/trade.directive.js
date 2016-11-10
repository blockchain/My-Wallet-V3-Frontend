angular
  .module('walletApp')
  .directive('trade', trade);

trade.$inject = ['$rootScope', 'Alerts', 'MyWallet', '$timeout', '$interval', 'buySell'];

function trade ($rootScope, Alerts, MyWallet, $timeout, $interval, buySell) {
  const directive = {
    restrict: 'A',
    replace: true,
    scope: {
      trade: '=',
      buy: '='
    },
    templateUrl: 'templates/trade.jade',
    link: link
  };
  return directive;

  function link (scope, elem, attrs) {
    scope.buySellDebug = $rootScope.buySellDebug;

    scope.update = () => angular.extend(scope, {
      error: buySell.tradeStateIn(buySell.states.error)(scope.trade),
      success: buySell.tradeStateIn(buySell.states.success)(scope.trade),
      pending: buySell.tradeStateIn(buySell.states.pending)(scope.trade),
      completed: buySell.tradeStateIn(buySell.states.completed)(scope.trade)
    });

    scope.update();
    scope.status = {};
    scope.expiredQuote = new Date() > scope.trade.quoteExpireTime;

    scope.cancel = (trade) => {
      scope.status.canceling = true;
      Alerts.confirm('CONFIRM_CANCEL_TRADE', {
        action: 'CANCEL_TRADE',
        cancel: 'GO_BACK'
      }).then(() => trade.cancel(), () => {})
        .catch((e) => { Alerts.displayError('ERROR_TRADE_CANCEL'); })
        .finally(() => scope.status.canceling = false);
    };

    scope.triggerBuy = () => {
      let t = scope.trade;
      scope.buy(t);
    };

    scope.updateBTCExpected = () => {
      scope.status.gettingQuote = true;

      const success = (quote) => {
        scope.status.gettingQuote = false;
        scope.btcExpected = quote;
      };

      scope.trade.btcExpected().then(success);
    };

    scope.$watch('trade.state', scope.update);
    scope.$watch('expiredQuote', (newVal, oldVal) => {
      if (newVal) scope.updateBTCExpected();
      else scope.status = {};
    });
    scope.$watch('status.canceling', () => {
      scope.canCancel = !scope.status.canceling && scope.trade.state === 'awaiting_transfer_in';
    });
  }
}
