@ModalNotificationCtrl = ($scope, Wallet, $modalInstance, notification) ->
  $scope.notification = notification
  
  $scope.ok = () ->
    $modalInstance.close(notification)
