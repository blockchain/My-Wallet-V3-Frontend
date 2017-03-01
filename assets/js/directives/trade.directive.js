angular
  .module('walletApp')
  .directive('trade', trade);

trade.$inject = ['$rootScope', 'Alerts', 'MyWallet', '$timeout', '$interval', 'buySell'];

function trade ($rootScope, Alerts, MyWallet, $timeout, $interval, buySell) {
  const directive = {
    restrict: 'A',
    replace: true,
    scope: {
      tradingDisabledReason: '=',
      tradingDisabled: '=',
      disabled: '=',
      trade: '=',
      buy: '=',
      usa: '='
    },
    templateUrl: 'templates/trade.pug',
    link: link
  };
  return directive;

  function link (scope, elem, attrs) {
    scope.buySellDebug = $rootScope.buySellDebug;
    scope.isTradingDisabled = scope.tradingDisabled && scope.tradingDisabledReason === 'disabled';

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

    scope.cancel = () => {
      scope.disabled = true;
      buySell.cancelTrade(scope.trade).finally(() => scope.disabled = false);
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
    scope.$watchGroup(['disabled', 'trade.state'], () => {
      scope.canCancel =
        !scope.disabled &&
        !scope.isTradingDisabled &&
        scope.trade.state === 'awaiting_transfer_in' &&
        angular.isFunction(scope.trade.cancel);
    });
  }
}
