angular
  .module('walletApp')
  .directive('trade', trade);

trade.$inject = ['$rootScope', 'Alerts', 'MyWallet', '$timeout', 'buySell'];

function trade ($rootScope, Alerts, MyWallet, $timeout, buySell) {
  const directive = {
    restrict: 'A',
    replace: true,
    scope: {
      trade: '=',
      buy: '&'
    },
    templateUrl: 'templates/trade.jade',
    link: link
  };
  return directive;

  function link (scope, elem, attrs) {
    let errorStates = ['cancelled', 'expired', 'rejected'];
    let successStates = ['completed', 'completed_test'];
    let pendingStates = ['awaiting_transfer_in', 'processing', 'reviewing'];
    let completedStates = ['expired', 'rejected', 'cancelled', 'completed', 'completed_test'];

    scope.status = {};

    scope.update = () => angular.extend(scope, {
      error: errorStates.indexOf(scope.trade.state) > -1,
      success: successStates.indexOf(scope.trade.state) > -1,
      pending: pendingStates.indexOf(scope.trade.state) > -1,
      completed: completedStates.indexOf(scope.trade.state) > -1
    });

    scope.cancel = (trade) => {
      scope.status.canceling = true;
      Alerts.confirm('CONFIRM_CANCEL_TRADE', {
        action: 'CANCEL_TRADE',
        cancel: 'GO_BACK'
      }).then(() => trade.cancel(), () => {})
        .catch((e) => { Alerts.displayError(e); })
        .finally(() => scope.status.canceling = false);
    };

    scope.$watch('trade.state', scope.update);
  }
}
