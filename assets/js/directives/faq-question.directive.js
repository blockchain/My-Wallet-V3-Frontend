
angular
  .module('walletApp')
  .directive('faqQuestion', faqQuestion);

function faqQuestion () {
  const directive = {
    restrict: 'E',
    templateUrl: 'templates/faq-question.jade'
  };
  return directive;
}
