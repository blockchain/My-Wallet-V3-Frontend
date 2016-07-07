angular.module('walletApp')
  .directive('buySteps', buySteps);

function buySteps () {
  const directive = {
    restrict: 'E',
    replace: true,
    scope: {
      buy: '&',
      allSteps: '=allSteps',
      profile: '=profile',
      exchange: '=exchange',
      transaction: '=transaction',
      partner: '=partner',
      method: '=method',
      step: '=step',
      currencySymbol: '=currencySymbol'
    },
    templateUrl: 'templates/buy-steps.jade',
    link: link
  };
  return directive;

  function link (scope, elem, attrs) {
  }
}
