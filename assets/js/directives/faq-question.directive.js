
angular
  .module('walletApp')
  .directive('faqQuestion', faqQuestion);

function faqQuestion () {
  const directive = {
    restrict: 'E',
    scope: {
      item: '=',
      tog: '=',
      index: '@'
    },
    templateUrl: 'templates/faq-question.jade'
  };
  return directive;
}
