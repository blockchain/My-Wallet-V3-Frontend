angular
  .module('walletApp')
  .directive('trade', trade);

trade.$inject = ['$rootScope', 'Alerts', 'MyWallet', '$timeout', 'buySell'];

function trade ($rootScope, Alerts, MyWallet, $timeout, buySell) {
  const directive = {
    restrict: 'A',
    replace: true,
    scope: {
      bitcoinReceived: '=',
      trade: '=',
      buy: '&'
    },
    templateUrl: 'templates/trade.jade',
    link: link
  };
  return directive;

  function link (scope, elem, attrs) {
    let successStates = ['completed', 'completed_test'];
    let errorStates = ['cancelled', 'expired', 'rejected'];
    let pendingStates = ['awaiting_transfer_in', 'processing', 'reviewing'];
    let completedStates = ['expired', 'rejected', 'cancelled', 'completed', 'completed_test'];

    scope.status = {};
    scope.error = errorStates.indexOf(scope.trade.state) > -1;
    scope.success = successStates.indexOf(scope.trade.state) > -1;
    scope.pending = pendingStates.indexOf(scope.trade.state) > -1;
    scope.completed = completedStates.indexOf(scope.trade.state) > -1;

    scope.cancel = (trade) => {
      Alerts.confirm('CONFIRM_CANCEL_TRADE', { action: 'CANCEL_TRADE', cancel: 'GO_BACK' })
        .then(() => trade.cancel().then(buySell.getTrades, Alerts.displayError));
    };
  }
}
