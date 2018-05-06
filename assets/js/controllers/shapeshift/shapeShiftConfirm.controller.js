angular
  .module('walletApp')
  .controller('ShapeShiftConfirmController', ShapeShiftConfirmController);

function ShapeShiftConfirmController ($scope, ShapeShift, Alerts, localStorageService, $uibModalStack, Env, modals) {
  let links;
  Env.then(env => links = env.shapeshift.surveyLinks);

  $scope.shiftHandler = ShapeShift.shift;
  $scope.openHelper = modals.openHelper;

  $scope.onComplete = (trade) => {
    $scope.vm.trade = trade;
    $scope.vm.goTo('receipt');
    ShapeShift.watchTradeForCompletion(trade).then(modals.openShiftTradeDetails);
  };

  $scope.onCancel = () => {
    $scope.vm.destination = null;
    Alerts.surveyCloseConfirm('shift-trade-survey', links, 0).then(() => { $scope.vm.goTo('create'); });
  };

  $scope.onExpiration = () => {
    $uibModalStack.dismissAll();
    $scope.vm.goTo('create');
  };
}
