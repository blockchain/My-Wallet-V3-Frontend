@ShowPrivateKeyCtrl = ($scope, $log, Wallet, $modalInstance, $timeout, $translate, addressObj) ->

  $scope.accessAllowed = false
  $scope.incorrectSecondPassword = false
  $scope.address = addressObj.address
  $scope.balance = addressObj.balance
  $scope.privKey = Wallet.my.getPrivateKey($scope.address)

  $scope.tryContinue = () ->
    if $scope.needsSecondPassword
      $scope.verifySecondPassword()
    else $scope.allowAccess()

  $scope.verifySecondPassword = () ->
    if Wallet.my.isCorrectSecondPassword($scope.secondPasswordInput)
      $scope.allowAccess()
    else $scope.incorrectSecondPassword = true

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

  $scope.$watch 'accessAllowed', (access) ->
    if access && $scope.needsSecondPassword
      $scope.privKey = Wallet.my.decryptSecretWithSecondPassword($scope.privKey, $scope.secondPasswordInput, Wallet.my.getSharedKey())

  $scope.$watch 'incorrectSecondPassword', (value) ->
    if value
      $timeout (->
        $scope.incorrectSecondPassword = false
      ), 3000

  $scope.needsSecondPassword = $scope.checkForSecondPassword()