@CreatedAccountCtrl = ($scope, Wallet, $modal) ->
  $scope.notification = Wallet.notifications[1]

  $scope.ok = () ->
    modalInstance.close($scope.notification)

  $scope.createdAccount = () ->
    modalInstance = $modal.open(
      templateUrl: "partials/notifications/created-account.jade"
      controller: CreatedAccountCtrl
      windowClass: "notification-modal"
    )
