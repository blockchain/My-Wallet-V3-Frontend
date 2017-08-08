angular
  .module('walletApp')
  .controller('ShapeShiftConfirmController', ShapeShiftConfirmController);

function ShapeShiftConfirmController ($scope, ShapeShift, Alerts, localStorageService, $uibModalStack, Env) {
  Env.then(env => {
    // let links = env.partners.shapeshift.surveyLinks;
    let links = [1, 2];

    $scope.onCancel = () => {
      let survey = 'shift-trade-survey';
      let surveyCache = localStorageService.get(survey);
      let shouldClose = surveyCache && surveyCache.index === links.length;

      if (shouldClose) {
        $scope.vm.goTo('create');
        $uibModalStack.dismissAll();
      } else {
        Alerts.surveyCloseConfirm(survey, links, 1, false, true).then(() => { $scope.vm.goTo('create'); });
      }
    };
  });
  $scope.shiftHandler = ShapeShift.shift;

  $scope.onComplete = (trade) => {
    $scope.vm.trade = trade;
    $scope.vm.goTo('receipt');
  };
}
