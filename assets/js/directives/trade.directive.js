angular
  .module('walletApp')
  .directive('trade', trade);

trade.$inject = ['$rootScope', 'Alerts', 'MyWallet', '$timeout'];

function trade ($rootScope, Alerts, MyWallet, $timeout) {
  const directive = {
    restrict: 'A',
    replace: true,
    scope: {
      bitcoinReceived: '=',
      pending: '@',
      cancel: '&',
      first: '=',
      trade: '=',
      buy: '&'
    },
    templateUrl: 'templates/trade.jade',
    link: link
  };
  return directive;

  function link (scope, elem, attrs) {
    scope.status = {};
    scope.pending = attrs.pending;
    scope.toggle = () => scope.active = !scope.active;

    scope.$watch('active', () => {
      if (scope.active) return;
      scope.active = scope.first && scope.pending;
    });

    scope.$watch('trade.state', () => {
      $timeout(() => {
        scope.cancelled = scope.trade.state === 'cancelled';
        scope.completed = scope.trade.bitcoinReceived || scope.cancelled;
      });
    });
  }
}
