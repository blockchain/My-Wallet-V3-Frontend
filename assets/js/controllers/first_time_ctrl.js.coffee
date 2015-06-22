walletApp.controller "FirstTimeCtrl", ($scope, Wallet, $modalInstance, firstTime) ->
  $scope.firstTime = firstTime
  $scope.ok = () ->
    $modalInstance.close(firstTime)
