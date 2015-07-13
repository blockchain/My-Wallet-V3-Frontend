walletApp.controller "ShowPrivateKeyCtrl", ($scope, $log, Wallet, $modalInstance, $timeout, $translate, addressObj) ->
  $scope.settings = Wallet.settings
  $scope.accessAllowed = false
  $scope.incorrectSecondPassword = false

  $scope.address = addressObj.address
  $scope.balance = addressObj.balance
  $scope.privKey = null

  $scope.tryContinue = () ->
    Wallet.askForSecondPasswordIfNeeded()
      .then (secondPassword) ->
        $scope.privKey = Wallet.my.wallet.getPrivateKeyForAddress(
          addressObj, secondPassword
        )
        $scope.accessAllowed = true
      .catch (error) ->
        $scope.incorrectSecondPassword = true
        $timeout (->
          $scope.incorrectSecondPassword = false
        ), 3000

  $scope.close = () ->
    Wallet.clearAlerts()
    $modalInstance.dismiss ""
