angular
  .module('walletApp')
  .controller('faqCtrl', faqCtrl);

function faqCtrl ($scope, faq) {
  $scope.questions = faq.questions.map(q => angular.merge({ displayed: false }, q));
  $scope.toggle = (q) => { q.displayed = !q.displayed; };
}
