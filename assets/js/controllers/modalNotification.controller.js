angular
  .module('walletApp')
  .controller('ModalNotificationCtrl', ModalNotificationCtrl);

function ModalNotificationCtrl ($scope, Wallet, $uibModalInstance, notification) {
  $scope.notification = notification;
  $scope.ok = () => $uibModalInstance.close(notification);
}
