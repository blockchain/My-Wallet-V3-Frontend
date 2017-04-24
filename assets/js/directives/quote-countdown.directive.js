angular
  .module('walletApp')
  .directive('quoteCountdown', quoteCountdown);

quoteCountdown.$inject = ['$interval'];

function quoteCountdown ($interval) {
  const directive = {
    restrict: 'E',
    replace: true,
    scope: {
      refreshQuote: '&',
      quote: '='
    },
    templateUrl: 'templates/quote-countdown.pug',
    link: link
  };
  return directive;

  function link (scope, elem, attrs) {
    let timeToExpiration;
    scope.expireCounter = () => timeToExpiration = 3000;
    scope.cancelCounter = () => $interval.cancel(scope.counter);
    scope.resetCounter = () => timeToExpiration = scope.quote.timeToExpiration;

    scope.counter = $interval(() => {
      if (!scope.quote.id) return;

      let time = timeToExpiration / 1000 / 60;
      let minutes = parseInt(time, 10);
      let seconds = parseInt((time % 1) * 60, 10);
      if (seconds < 10) seconds = '0' + seconds;
      if (time <= 0) scope.refreshQuote();

      timeToExpiration -= 1000;
      scope.count = timeToExpiration <= 0 ? '0:00' : minutes + ':' + seconds;
    }, 1000);

    scope.$on('$destroy', scope.cancelCounter);
    scope.$watch('quote.id', (id) => id && scope.resetCounter());
  }
}
