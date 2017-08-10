angular
  .module('walletApp')
  .controller('ShapeShiftReceiptController', ShapeShiftReceiptController);

function ShapeShiftReceiptController ($scope, Alerts, Env, localStorageService) {
  let links;
  Env.then(env => links = env.shapeshift.surveyLinks);

  $scope.trade = $scope.vm.trade;
  $scope.onClose = () => {
    let survey = 'shift-trade-survey';
    let surveyCache = localStorageService.get(survey);
    console.log(surveyCache);
    let shouldClose = surveyCache && surveyCache.index === links.length - 1;
    console.log(shouldClose);
    if (shouldClose) {
      $scope.vm.goTo('create');
    } else {
      Alerts.surveyCloseConfirm(survey, links, 1).then(() => { $scope.vm.goTo('create'); });
    }
  };
}
