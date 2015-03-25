@ShowPrivateKeyCtrl = ($scope, $log, Wallet, $modalInstance, $timeout, $translate, addressObj) ->

  $scope.accessAllowed = false
  $scope.incorrectPassword = false
  $scope.address = addressObj.address
  $scope.balance = addressObj.balance
  $scope.privKey = Wallet.my.getPrivateKey($scope.address)

  $scope.tryConfirmPassword = () ->
    if $scope.needsSecondPassword
      $scope.verifySecondPassword()
    else if !$scope.needsSecondPassword
      $scope.verifyMainPassword()

  $scope.verifyMainPassword = () ->
    $scope.tryAllowAccess Wallet.my.isCorrectMainPassword($scope.passwordInput)

  $scope.verifySecondPassword = () ->
    $scope.tryAllowAccess Wallet.my.isCorrectSecondPassword($scope.secondPasswordInput)

  $scope.tryAllowAccess = (qualifier) ->
    if typeof qualifier == 'boolean'
      $scope.accessAllowed = qualifier
      $scope.incorrectPassword = !qualifier

  $scope.checkForSecondPassword = () ->
    doubleEncryption = false
    try
      if !Wallet.my.isCorrectSecondPassword('')
        doubleEncryption = true
    catch e
      doubleEncryption = false
    return doubleEncryption

  $scope.close = () ->
    Wallet.clearAlerts()
    $modalInstance.dismiss ""

  $scope.$watch 'accessAllowed', (access) ->
    if access && $scope.needsSecondPassword
      $scope.privKey = Wallet.my.decryptSecretWithSecondPassword($scope.privKey, $scope.secondPasswordInput, Wallet.my.getSharedKey())

  $scope.$watch 'incorrectPassword', (value) ->
    if value
      $timeout (->
        $scope.incorrectPassword = false
      ), 3000

  $scope.needsSecondPassword = $scope.checkForSecondPassword()