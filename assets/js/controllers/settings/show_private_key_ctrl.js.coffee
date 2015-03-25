@ShowPrivateKeyCtrl = ($scope, $log, Wallet, $modalInstance, $timeout, $translate, addressObj) ->

  $scope.address = addressObj.address
  $scope.balance = addressObj.balance
  $scope.privKey = Wallet.my.getPrivateKey($scope.address)

  $scope.close = () ->
    Wallet.clearAlerts()
    $modalInstance.dismiss ""