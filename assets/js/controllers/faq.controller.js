angular
  .module('walletApp')
  .controller('faqCtrl', faqCtrl);

function faqCtrl ($scope, faq, Env, tradeStatus, languages, $uibModal, Ethereum, ShapeShift) {
  let showEthereum = Ethereum.userHasAccess || void 0;
  let showShapeShift = ShapeShift.userHasAccess || void 0;

  faq.then((faq) => {
    $scope.questions = faq.questions
      .filter(q => !q.eth || showEthereum)
      .filter(q => !q.shapeshift || showShapeShift)
      .map(q => angular.merge({ displayed: false, values: { showEthereum } }, q));
    Env.then(env => {
      if (env.webHardFork.faqMessage) {
        let a = languages.localizeMessage(env.webHardFork.faqMessage.answer);
        let q = languages.localizeMessage(env.webHardFork.faqMessage.question);
        let actions = env.webHardFork.faqMessage.actions;
        $scope.questions.unshift({
          translated: true,
          actions: actions.map(a => ({
            link: a.link,
            title: a.title && languages.localizeMessage(a.title)
          })),
          question: q,
          answer: a
        });
      }
    });
  });

  $scope.toggle = (q) => { q.displayed = !q.displayed; };
}
