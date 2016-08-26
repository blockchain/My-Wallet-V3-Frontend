
angular
  .module('walletApp')
  .directive('quoteCountdown', quoteCountdown);

quoteCountdown.$inject = ['$interval', '$rootScope'];

function quoteCountdown ($interval, $rootScope) {
  const directive = {
    restrict: 'E',
    replace: true,
    scope: {
      quote: '=',
      getQuote: '&'
    },
    templateUrl: 'templates/quote.jade',
    link: link
  };
  return directive;

  function link (scope, elem, attrs) {
    scope.buySellDebug = $rootScope.buySellDebug;

    scope.startCounter = () => {
      scope.counter = $interval(() => {
        let now = new Date();
        let expiration = new Date(scope.quote.expiresAt || scope.quote.expiryTime);
        let diff = expiration - now;
        let time = diff / 1000 / 60;
        let minutes = parseInt(time, 10);
        let seconds = parseInt((time % 1) * 60, 10);
        if (seconds < 10) seconds = '0' + seconds;
        if (time < 0) scope.getQuote();

        scope.count = minutes + ':' + seconds;
      }, 1000);
    };

    scope.cancelCounter = () => $interval.cancel(scope.counter);

    scope.restartCounter = () => {
      scope.isFake = scope.quote && !scope.quote.id;
      scope.count = undefined;
      scope.cancelCounter();

      if (!scope.quote || scope.isFake) return;
      scope.count = '15:00';
      scope.startCounter();
    };

    scope.$watch('quote', scope.restartCounter);
    scope.$on('$destroy', scope.cancelCounter);

    // QA tool:
    scope.expireQuote = () => {
      scope.quote.expiresAt = new Date(new Date().getTime() + 3 * 1000);
    };
  }
}
