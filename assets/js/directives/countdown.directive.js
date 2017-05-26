angular
  .module('walletApp')
  .directive('countdown', countdown);

countdown.$inject = ['$interval'];

function countdown ($interval) {
  const directive = {
    restrict: 'E',
    replace: true,
    scope: {
      timeToExpiration: '=',
      onExpiration: '&',
      debug: '=',
      message: '='
    },
    templateUrl: 'templates/countdown.pug',
    link: link
  };
  return directive;

  function link (scope, elem, attrs) {
    let timeToExpiration = scope.timeToExpiration();
    scope.expireCounter = () => timeToExpiration = 3000;
    scope.cancelCounter = () => $interval.cancel(scope.counter);
    scope.resetTimeToExpiration = () => timeToExpiration = scope.timeToExpiration();

    scope.counter = $interval(() => {
      let time = timeToExpiration / 1000 / 60;
      let minutes = parseInt(time, 10);
      let seconds = parseInt((time % 1) * 60, 10);
      if (seconds < 10) seconds = '0' + seconds;
      if (time <= 0) scope.onExpiration().then(scope.resetTimeToExpiration);

      scope.count = timeToExpiration <= 0 ? '0:00' : minutes + ':' + seconds;
      timeToExpiration -= 1000;
    }, 1000);

    scope.$on('$destroy', scope.cancelCounter);
  }
}
