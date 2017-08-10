angular
  .module('walletApp')
  .controller('ShapeShiftReceiptController', ShapeShiftReceiptController);

function ShapeShiftReceiptController ($scope, Alerts, Env) {
  let links;
  Env.then(env => links = env.shapeshift.surveyLinks);

  $scope.trade = $scope.vm.trade;

  $scope.onClose = () => {
    $scope.vm.goTo('create');
  };
}
