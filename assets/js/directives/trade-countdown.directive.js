angular
  .module('walletApp')
  .directive('tradeCountdown', tradeCountdown);

tradeCountdown.$inject = ['$interval'];

function tradeCountdown ($interval) {
  const directive = {
    restrict: 'E',
    replace: true,
    scope: {
      t: '='
    },
    templateUrl: 'templates/trade-countdown.pug',
    link: link
  };
  return directive;

  function link (scope, elem, attrs) {
    let timeToExpiration;
    scope.cancelCounter = () => $interval.cancel(scope.counter);
    scope.setCounter = () => timeToExpiration = scope.t.quoteExpireTime - new Date().getTime();

    scope.counter = $interval(() => {
      let time = timeToExpiration / 1000 / 60;
      let minutes = parseInt(time, 10);
      let seconds = parseInt((time % 1) * 60, 10);
      if (seconds < 10) seconds = '0' + seconds;
      if (time <= 0) scope.t.expired = true;

      scope.count = timeToExpiration <= 0 ? '0:00' : minutes + ':' + seconds;
      timeToExpiration -= 1000;
    }, 1000);

    scope.$on('$destroy', scope.cancelCounter);
    scope.$watch('t.id', (id) => id && scope.setCounter());
  }
}
