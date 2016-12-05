angular
  .module('walletApp')
  .controller('faqCtrl', faqCtrl);

function faqCtrl ($scope, faq, buyStatus, $uibModal) {
  $scope.questions = faq.questions.map(q => angular.merge({ displayed: false }, q));
  $scope.toggle = (q) => { q.displayed = !q.displayed; };

  $scope.subscribe = () => {
    $uibModal.open({
      templateUrl: 'partials/subscribe-modal.jade',
      windowClass: 'bc-modal initial',
      controller: 'SubscribeCtrl'
    });
  };

  buyStatus.canBuy().then((canBuy) => {
    !buyStatus.userHasAccount() && !canBuy && ($scope.questions[0] = {name: 'CAN_I_BUY_UNINVITED', values: {click: $scope.subscribe}});
  });
}
