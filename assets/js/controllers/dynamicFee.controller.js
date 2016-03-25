angular
  .module('walletApp')
  .controller('DynamicFeeController', DynamicFeeController);

function DynamicFeeController($scope, $translate, $uibModalInstance, feeValues) {
  angular.extend($scope, feeValues);

  $scope.balanceOverflow = $scope.suggestedFee > $scope.maxFee;

  if ($scope.surge) {
    $scope.titleTranslation = 'SURGE_WARN';
    $scope.bodyTranslation = 'SURGE_EXPLAIN';
    $scope.btnTranslation = 'CONTINUE_WITH';
  } else if ($scope.balanceOverflow) {
    $scope.titleTranslation = 'LOW_FEE_WARN';
    $scope.bodyTranslation = 'LOW_FEE_EXPLAIN';
    $scope.btnTranslation = 'USE_VALUES';
  } else if ($scope.currentFee < $scope.suggestedFee) {
    $scope.titleTranslation = 'LOW_FEE_WARN';
    $scope.bodyTranslation = 'LOW_FEE_EXPLAIN';
    $scope.btnTranslation = 'RAISE_TO';
  } else {
    $scope.titleTranslation = 'HIGH_FEE_WARN';
    $scope.bodyTranslation = 'HIGH_FEE_EXPLAIN';
    $scope.btnTranslation = 'LOWER_TO';
  }

  $scope.cancel = () => $uibModalInstance.dismiss('cancelled');
  $scope.useCurrent = () => $uibModalInstance.close(null);
  $scope.useSuggested = () => $uibModalInstance.close($scope.suggestedFee);
}
