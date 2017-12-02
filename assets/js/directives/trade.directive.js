angular
  .module('walletDirectives')
  .directive('trade', trade);

trade.$inject = ['Env', 'Alerts', 'MyWallet', '$timeout', '$interval', 'coinify', 'Exchange'];

function trade (Env, Alerts, MyWallet, $timeout, $interval, coinify, Exchange) {
  const directive = {
    restrict: 'A',
    replace: true,
    scope: {
      tradingDisabledReason: '=',
      userActionRequired: '=',
      tradingDisabled: '=',
      conversion: '=',
      disabled: '=',
      trade: '=',
      buy: '=',
      sell: '=',
      usa: '='
    },
    templateUrl: 'templates/trade.pug',
    link: link
  };
  return directive;

  function link (scope, elem, attrs) {
    Env.then(env => {
      scope.qaDebugger = env.qaDebugger;
    });

    scope.isTradingDisabled = scope.tradingDisabled && scope.tradingDisabledReason === 'disabled';

    scope.update = () => angular.extend(scope, {
      error: coinify.tradeStateIn(coinify.states.error)(scope.trade),
      success: coinify.tradeStateIn(coinify.states.success)(scope.trade),
      pending: coinify.tradeStateIn(coinify.states.pending)(scope.trade),
      completed: coinify.tradeStateIn(coinify.states.completed)(scope.trade)
    });

    scope.update();
    scope.status = {};
    scope.expiredQuote = new Date() > scope.trade.quoteExpireTime;
    scope.dateFormat = 'd MMMM yyyy, ' + (scope.usa ? 'h:mm a' : 'HH:mm');
    scope.dateFormat = scope.$root.size.xs ? 'MMM d' : scope.dateFormat;

    scope.cancel = () => {
      if (!scope.canCancel) return;
      scope.disabled = true;
      let exchange = MyWallet.wallet.external.coinify;
      coinify.cancelTrade(scope.trade).then(() => Exchange.fetchProfile(exchange)).finally(() => scope.disabled = false);
    };

    scope.triggerBuy = () => {
      scope.buy(null, scope.trade);
    };

    scope.triggerSell = () => {
      scope.sell(null, scope.trade);
    };

    scope.updateBTCExpected = () => {
      scope.status.gettingQuote = true;

      const success = (quote) => {
        scope.status.gettingQuote = false;
        scope.btcExpected = quote;
      };

      const error = (e) => {
        scope.status.gettingQuote = false;
      };

      scope.trade.btcExpected().then(success).catch(error);
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
        scope.userActionRequired &&
        angular.isFunction(scope.trade.cancel) &&
        scope.trade.state === 'awaiting_transfer_in';
    });
  }
}
