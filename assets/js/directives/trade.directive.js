angular
  .module('walletApp')
  .directive('trade', trade);

trade.$inject = ['$uibModal'];

function trade ($uibModal) {
  const directive = {
    restrict: 'A',
    replace: true,
    scope: {
      trade: '='
    },
    templateUrl: 'templates/trade.jade',
    link: link
  };
  return directive;

  function link (scope, elem, attrs) {
    scope.buy = () => {
      let iSignThisProps = null;

      $uibModal.open({
        templateUrl: 'partials/isignthis-modal.jade',
        backdrop: 'static',
        keyboard: false,
        controller: 'iSignThisCtrl',
        windowClass: 'bc-modal coinify',
        resolve: { trade: scope.trade,
                   iSignThisProps: iSignThisProps }
      });
    };
  }
}
