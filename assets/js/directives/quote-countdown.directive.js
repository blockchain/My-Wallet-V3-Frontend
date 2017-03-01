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
      tradeObj: '=',
      quote: '='
    },
    templateUrl: 'templates/quote-countdown.pug',
    link: link
  };
  return directive;

  function link (scope, elem, attrs) {
    scope.counter = $interval(() => {
      if (!scope.quote && !scope.tradeObj ||
           scope.quote && !scope.quote.id) return;

      let expiresAt;
      let now = new Date();

      if (scope.quote) expiresAt = new Date(scope.quote.expiresAt);
      else expiresAt = new Date(scope.tradeObj.quoteExpireTime);

      scope.expiredQuote = false;

      let diff = expiresAt - now;
      let time = diff / 1000 / 60;
      let minutes = parseInt(time, 10);
      let seconds = parseInt((time % 1) * 60, 10);
      if (seconds < 10) seconds = '0' + seconds;
      if (time <= 0) scope.expiredQuote = true;

      scope.count = !time ? undefined : minutes + ':' + seconds;
    }, 1000);

    scope.cancelCounter = () => $interval.cancel(scope.counter);

    scope.$on('$destroy', scope.cancelCounter);
  }
}
