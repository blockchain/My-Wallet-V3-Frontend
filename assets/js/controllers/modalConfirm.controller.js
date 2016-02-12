angular
  .module('walletApp')
  .controller("ModalConfirmCtrl", ModalConfirmCtrl);

function ModalConfirmCtrl($scope, Wallet, $uibModalInstance, translation) {
  $scope.translation = translation

  $scope.dismiss = () => {
    $uibModalInstance.dismiss();
  }

  $scope.logout = () => {
    $uibModalInstance.close();
  }
}
