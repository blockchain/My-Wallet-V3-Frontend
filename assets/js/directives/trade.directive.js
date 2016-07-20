angular
  .module('walletApp')
  .directive('trade', trade);

trade.$inject = ['$uibModal'];

function trade ($uibModal) {
  const directive = {
    restrict: 'A',
    replace: true,
    scope: {
      pending: '@',
      trade: '=',
      buy: '&'
    },
    templateUrl: 'templates/trade.jade',
    link: link
  };
  return directive;

  function link (scope, elem, attrs) {
    scope.pending = attrs.pending;
  }
}
