angular
  .module('walletApp')
  .controller('BitcoinCashExchangeController', BitcoinCashExchangeController);

function BitcoinCashExchangeController ($scope, ShapeShift, Env, modals, Alerts, $uibModalStack, localStorageService) {
  let enumify = (...ns) => ns.reduce((e, n, i) => angular.merge(e, {[n]: i}), {});

  $scope.steps = enumify('exchange-create', 'exchange-confirm', 'exchange-receipt');
  $scope.onStep = (s) => $scope.steps[s] === $scope.step;
  $scope.goTo = (s) => $scope.step = $scope.steps[s];

  $scope.goTo('exchange-create');

  $scope.rateHandler = ShapeShift.getRate;
  $scope.quoteHandler = ShapeShift.getQuote;
  $scope.buildPayment = ShapeShift.buildPayment;
  $scope.approximateQuoteHandler = ShapeShift.getApproximateQuote;

  $scope.onCreateComplete = (payment, fee, quote) => {
    $scope.fee = fee;
    $scope.quote = quote;
    $scope.payment = payment;
    $scope.goTo('exchange-confirm');
  };

  let links;
  Env.then(env => links = env.shapeshift.surveyLinks);

  $scope.shiftHandler = ShapeShift.shift;
  $scope.openHelper = modals.openHelper;

  $scope.onConfirmComplete = (trade) => {
    $scope.vm.trade = trade;
    $scope.goTo('exchange-receipt');
    ShapeShift.watchTradeForCompletion(trade).then(modals.openShiftTradeDetails);
  };

  $scope.onCancel = () => {
    Alerts.surveyCloseConfirm('shift-trade-survey', links, 0).then(() => { $scope.vm.goTo('exchange-create'); });
  };

  $scope.onExpiration = () => {
    $uibModalStack.dismissAll();
    $scope.vm.goTo('exchange-create');
  };

  $scope.trade = $scope.vm.trade;

  $scope.onClose = () => {
    let survey = 'shift-trade-survey';
    let surveyCache = localStorageService.get(survey);
    let shouldClose = surveyCache && surveyCache.index === links.length - 1;
    if (shouldClose) $scope.vm.goTo('create');
    else Alerts.surveyCloseConfirm(survey, links, 1).then(() => { $scope.vm.goTo('create'); });
  };
}
