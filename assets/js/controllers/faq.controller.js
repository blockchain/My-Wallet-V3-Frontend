angular
  .module('walletApp')
  .controller('faqCtrl', faqCtrl);

function faqCtrl ($scope, faq) {
  $scope.questions = faq.questions.map(name => ({ name, displayed: false }));
  $scope.toggle = (q) => { q.displayed = !q.displayed; };
}
