angular.module('walletApp')
  .directive('buySteps', buySteps);

function buySteps () {
  const directive = {
    restrict: 'E',
    replace: true,
    scope: {
      buy: '&',
      step: '=',
      fields: '=',
      partner: '=',
      exchange: '=',
      tradeObj: '=',
      onStep: '=',
      afterStep: '=',
      beforeStep: '=',
      getMethod: '=',
      transaction: '=',
      exchangeAcct: '=',
      tradeError: '=',
      paymentInfo: '=',
      currencySymbol: '='
    },
    templateUrl: 'templates/buy-steps.jade',
    link: link
  };
  return directive;

  function link (scope, elem, attrs) {
    if (scope.tradeObj) scope.medium = scope.tradeObj.medium;
  }
}
