angular
  .module('walletApp')
  .controller('faqCtrl', faqCtrl);

function faqCtrl ($scope, faq, buyStatus, $uibModal, Ethereum) {
  let showEthereum = Ethereum.userHasAccess || void 0;

  $scope.questions = faq.questions
    .filter(q => !q.eth || showEthereum)
    .map(q => angular.merge({ displayed: true, values: { showEthereum } }, q));

  $scope.toggle = (q) => { q.displayed = !q.displayed; };

  $scope.subscribe = () => {
    $uibModal.open({
      templateUrl: 'partials/subscribe-modal.pug',
      windowClass: 'bc-modal initial',
      controller: 'SubscribeCtrl'
    });
  };

  buyStatus.canBuy().then((canBuy) => {
    !buyStatus.userHasAccount() && !canBuy && ($scope.questions[0] = {name: 'CAN_I_BUY_UNINVITED', values: {click: $scope.subscribe}});
  });
}
