angular
  .module('walletApp')
  .directive('quoteCountdown', quoteCountdown);

quoteCountdown.$inject = ['$interval'];

function quoteCountdown ($interval) {
  const directive = {
    restrict: 'E',
    replace: true,
    scope: {
      expiredQuote: '=',
      tradeCreatedAt: '=',
      quote: '='
    },
    templateUrl: 'templates/quote-countdown.jade',
    link: link
  };
  return directive;

  function link (scope, elem, attrs) {
    scope.counter = $interval(() => {
      if (!scope.quote && !scope.tradeCreatedAt) return;
      let now = new Date();
      let expiresAt;
      if (scope.quote) {
        expiresAt = new Date(scope.quote.expiresAt);
      } else {
        // TODO: use trade.priceQuoteExpiryTime once Coinify adds it
        expiresAt = new Date(scope.tradeCreatedAt).getTime() + 15 * 60 * 1000;
      }
      scope.expiredQuote = false;

      let diff = expiresAt - now;
      let time = diff / 1000 / 60;
      let minutes = parseInt(time, 10);
      let seconds = parseInt((time % 1) * 60, 10);
      if (seconds < 10) seconds = '0' + seconds;
      if (time <= 0) {
        scope.expiredQuote = true;
      }

      scope.count = !time ? undefined : minutes + ':' + seconds;
    }, 1000);

    scope.cancelCounter = () => $interval.cancel(scope.counter);

    scope.$on('$destroy', scope.cancelCounter);
  }
}
