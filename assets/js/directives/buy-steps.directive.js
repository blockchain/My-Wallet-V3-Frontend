angular.module('walletApp')
  .directive('buySteps', buySteps);

function buySteps () {
  const directive = {
    restrict: 'E',
    replace: true,
    scope: {
      buy: '&',
      step: '=',
      method: '=',
      profile: '=',
      partner: '=',
      exchange: '=',
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
  }
}
