@MobileCtrl = ($scope, Wallet) ->
  $scope.display = {pairingCode: false}
  $scope.user = Wallet.user