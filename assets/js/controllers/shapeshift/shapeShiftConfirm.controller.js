angular
  .module('walletApp')
  .controller('ShapeShiftConfirmController', ShapeShiftConfirmController);

function ShapeShiftConfirmController ($scope, ShapeShift, Alerts, localStorageService, $uibModalStack, Env, modals) {
  let links;
  Env.then(env => links = env.shapeshift.surveyLinks);

  $scope.shiftHandler = ShapeShift.shift;

  $scope.onComplete = (trade) => {
    $scope.vm.trade = trade;
    $scope.vm.goTo('receipt');
    ShapeShift.watchTradeForCompletion(trade).then(modals.openShiftTradeDetails);
  };

  $scope.onCancel = () => {
    Alerts.surveyCloseConfirm('shift-trade-survey', links, 0).then(() => { $scope.vm.goTo('create'); });
  };
}
