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
    scope.update = () => angular.extend(scope, {
      error: buySell.tradeStateIn(buySell.states.error)(scope.trade),
      success: buySell.tradeStateIn(buySell.states.success)(scope.trade),
      pending: buySell.tradeStateIn(buySell.states.pending)(scope.trade),
      completed: buySell.tradeStateIn(buySell.states.completed)(scope.trade)
    });

    scope.update();

    scope.status = {};
    scope.status.gettingQuote = true;

    let isExpiredQuote = new Date() > scope.trade.quoteExpireTime;

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

    scope.updateBTCExpected = (quote) => {
      scope.status.gettingQuote = false;
      scope.btcExpected = quote;
    };

    if (isExpiredQuote && scope.pending) {
      scope.trade.btcExpected().then(scope.updateBTCExpected);
    } else {
      scope.status = {};
    }

    scope.$watch('trade.state', scope.update);
  }
}
