walletApp.controller "ShowPrivateKeyCtrl", ($scope, $log, Wallet, $modalInstance, $timeout, $translate, addressObj) ->

  $scope.settings = Wallet.settings
  $scope.accessAllowed = false
  $scope.incorrectSecondPassword = false
  $scope.address = addressObj.address
  $scope.balance = addressObj.balance
  $scope.privKey = null

  $scope.tryContinue = () ->
    if $scope.needsSecondPassword
      if Wallet.my.isCorrectSecondPassword($scope.secondPasswordInput)
        $scope.privKey = Wallet.store.getPrivateKey($scope.address, $scope.secondPasswordInput)
        $scope.allowAccess()
      else $scope.incorrectSecondPassword = true
    else
      $scope.privKey = Wallet.store.getPrivateKey($scope.address)
      $scope.allowAccess()

  $scope.checkForSecondPassword = () ->
    doubleEncryption = false
    try
      if !Wallet.my.isCorrectSecondPassword('')
        doubleEncryption = true
    catch e
      doubleEncryption = false
    return doubleEncryption

  $scope.allowAccess = () ->
    $scope.accessAllowed = true

  $scope.close = () ->
    Wallet.clearAlerts()
    $modalInstance.dismiss ""

  $scope.$watch 'incorrectSecondPassword', (value) ->
    if value
      $timeout (->
        $scope.incorrectSecondPassword = false
      ), 3000

  $scope.needsSecondPassword = $scope.checkForSecondPassword()
