angular.module('walletApp').controller "ShowPrivateKeyCtrl", ($scope, $log, Wallet, $modalInstance, $timeout, $translate, addressObj) ->
  $scope.settings = Wallet.settings
  $scope.accessAllowed = false

  $scope.address = addressObj.address
  $scope.balance = addressObj.balance
  $scope.privKey = null

  $scope.tryContinue = () ->
    Wallet.askForSecondPasswordIfNeeded()
      .then (secondPassword) ->
        $scope.accessAllowed = true
        $scope.privKey = Wallet.my.wallet.getPrivateKeyForAddress(
          addressObj, secondPassword
        )

  $scope.close = () ->
    Wallet.clearAlerts()
    $modalInstance.dismiss ""
