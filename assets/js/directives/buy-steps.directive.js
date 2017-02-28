angular.module('walletApp')
  .directive('buySteps', buySteps);

function buySteps () {
  const directive = {
    restrict: 'E',
    scope: {
      buy: '&',
      tradeObj: '=',
      needsKyc: '=',
      onStep: '=',
      afterStep: '=',
      beforeStep: '=',
      getMedium: '=',
      transaction: '=',
      exchangeAcct: '=',
      paymentInfo: '=',
      currencySymbol: '='
    },
    templateUrl: 'templates/buy-steps.pug',
    link: link
  };
  return directive;

  function link (scope, elem, attrs) {
    if (scope.tradeObj) scope.medium = scope.tradeObj.medium;

    scope.$watch('tradeObj', () => {
      if (scope.tradeObj && scope.tradeObj.constructor.name === 'CoinifyKYC') scope.isKYC = true;
    });
  }
}
