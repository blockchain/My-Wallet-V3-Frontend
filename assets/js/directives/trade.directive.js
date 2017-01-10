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
      buy: '=',
      usa: '='
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
    scope.dateFormat = 'd MMMM yyyy, ' + (scope.usa ? 'h:mm a' : 'HH:mm');

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

    scope.logDetails = (trade) => {
      console.log('------------ Details ------------');
      console.log('Trade ID:', trade.id);
      console.log('Trade State:', trade.state);
      console.log('Created At:', trade.createdAt);
      console.log('Receive Address:', trade.receiveAddress);
    };

    scope.$watch('trade.state', scope.update);
    scope.$watch('expiredQuote', (newVal, oldVal) => {
      if (newVal) scope.updateBTCExpected();
      else scope.status = {};
    });
    scope.$watchGroup(['status.canceling', 'trade.state'], () => {
      scope.canCancel =
        !scope.status.canceling &&
        scope.trade.state === 'awaiting_transfer_in' &&
        angular.isFunction(scope.trade.cancel);
    });
  }
}
