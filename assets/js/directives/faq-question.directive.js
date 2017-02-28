
angular
  .module('walletApp')
  .directive('faqQuestion', faqQuestion);

function faqQuestion () {
  const directive = {
    restrict: 'E',
    scope: {
      q: '=question',
      onToggle: '&'
    },
    templateUrl: 'templates/faq-question.pug'
  };
  return directive;
}
