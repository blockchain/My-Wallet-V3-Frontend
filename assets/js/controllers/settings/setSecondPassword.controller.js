angular
  .module('walletApp')
  .controller('SetSecondPasswordCtrl', SetSecondPasswordCtrl);

function SetSecondPasswordCtrl($scope, $timeout, $uibModalInstance, Wallet) {
  $scope.busy = null;
  $scope.fields = {
    password: '',
    confirmation: ''
  };

  $scope.close = () => $uibModalInstance.dismiss('');

  $scope.setPassword = () => {
    if ($scope.busy || $scope.form.$invalid) return;
    $scope.busy = true;
    $scope.$safeApply();

    const success = () => {
      $scope.busy = false;
      $uibModalInstance.dismiss('');
    };

    $timeout(() => {
      Wallet.setSecondPassword($scope.fields.password, success);
    }, 500);
  };
}
