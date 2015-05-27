@SentBitcoinCtrl = ($scope, Wallet) ->
  $scope.notification = Wallet.notifications[0]

  $scope.ok = () ->
    modalInstance.close($scope.notification)

  $scope.sentBitcoin = () ->
    modalInstance = $modal.open(
      templateUrl: "partials/notifications/sent-bitcoin.jade"
      controller: SentBitcoinCtrl
      windowClass: "notification-modal"
    )
