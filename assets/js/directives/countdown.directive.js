angular
  .module('walletDirectives')
  .directive('countdown', countdown);

countdown.$inject = ['$interval'];

function countdown ($interval) {
  const directive = {
    restrict: 'E',
    replace: true,
    scope: {
      timeToExpiration: '=',
      onExpiring: '&',
      onExpiration: '&',
      message: '=',
      debug: '='
    },
    templateUrl: 'templates/countdown.pug',
    link: link
  };
  return directive;

  function link (scope, elem, attrs) {
    scope.message = scope.message || attrs.message;
    let timeToExpiration = scope.timeToExpiration();
    scope.expireCounter = () => timeToExpiration = 3000;
    scope.cancelCounter = () => $interval.cancel(scope.counter);
    scope.resetTimeToExpiration = () => timeToExpiration = scope.timeToExpiration();

    scope.counter = $interval(() => {
      scope.time = timeToExpiration / 1000 / 60;
      scope.minutes = parseInt(scope.time, 10);
      scope.seconds = parseInt((scope.time % 1) * 60, 10);

      if (scope.minutes === 5 && scope.seconds === 0) scope.onExpiring();
      if (scope.seconds < 10) scope.seconds = '0' + scope.seconds;
      if (scope.time <= 0) scope.onExpiration() && scope.onExpiration().then(scope.resetTimeToExpiration);

      scope.count = timeToExpiration <= 0 ? '0:00' : scope.minutes + ':' + scope.seconds;
      timeToExpiration -= 1000;
    }, 1000);

    scope.$on('$destroy', scope.cancelCounter);
  }
}
