angular
  .module('walletApp')
  .controller('faqCtrl', faqCtrl);

function faqCtrl ($scope, faq, buyStatus) {
  $scope.questions = faq.questions.map(q => angular.merge({ displayed: false }, q));
  $scope.toggle = (q) => { q.displayed = !q.displayed; };

  buyStatus.canBuy().then((canBuy) => {
    !canBuy && ($scope.questions[0] = {name: 'CAN_I_BUY_UNINVITED'});
  });
}
