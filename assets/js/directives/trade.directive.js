angular
  .module('walletApp')
  .directive('trade', trade);

trade.$inject = ['$rootScope', 'Alerts', 'MyWallet'];

function trade ($rootScope, Alerts, MyWallet) {
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

    scope.completed = scope.trade.bitcoinReceived ||
                      scope.trade.state === 'cancelled';

    scope.$watch('active', () => {
      if (scope.active) return;
      scope.active = scope.first && scope.pending;
    });
  }
}
