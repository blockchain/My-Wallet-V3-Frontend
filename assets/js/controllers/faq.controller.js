angular
  .module('walletApp')
  .controller('faqCtrl', faqCtrl);

function faqCtrl ($scope, faq, Env, buyStatus, languages, $uibModal, Ethereum, ShapeShift) {
  Env.then(env => {
    if (env.webHardFork.faqMessage) {
      let a = languages.localizeMessage(env.webHardFork.faqMessage.answer);
      let q = languages.localizeMessage(env.webHardFork.faqMessage.question);
      let actions = env.webHardFork.faqMessage.actions.map((a) => { a.title = languages.localizeMessage(a.title); return a; });
      $scope.questions.unshift({
        translated: true,
        actions: actions,
        question: q,
        answer: a
      });
    }
  });

  let showEthereum = Ethereum.userHasAccess || void 0;
  let showShapeShift = ShapeShift.userHasAccess || void 0;

  $scope.questions = faq.questions
    .filter(q => !q.eth || showEthereum)
    .filter(q => !q.shapeshift || showShapeShift)
    .map(q => angular.merge({ displayed: false, values: { showEthereum } }, q));

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
