walletApp.controller "AddressImportCtrl", ($scope, $log, Wallet, $modalInstance, $translate, $state, $timeout) ->

  $scope.settings = Wallet.settings
  $scope.accounts = Wallet.accounts
  $scope.step = 1
  $scope.BIP38 = false
  $scope.sweeping = false
  $scope.cameraIsOn = false

  $scope.verifyBIP38Passphrase = undefined

  $scope.status =
    busy: false

  $scope.fields =
    addressOrPrivateKey: ''
    bip38passphrase: ''
    account: null

  $scope.address = null

  $scope.$watchCollection "accounts", (newValue) ->
    $scope.fields.account = Wallet.accounts[0]

  $scope.isValidAddressOrPrivateKey = (val) ->
    Wallet.my.isValidAddress(val) || Wallet.my.isValidPrivateKey(val)

  # Import address or private key

  $scope.attemptImport = () ->
    $scope.status.busy = true
    addressOrPrivateKey = $scope.fields.addressOrPrivateKey.trim()

    needsBip38 = (callback) ->
      $scope.status.busy = false
      $scope.BIP38 = true
      $scope.verifyBIP38Passphrase = callback

    success = (address) ->
      $scope.status.busy = false
      $scope.address = address
      $scope.step = 2

    error = (err, address=null) ->
      $scope.status.busy = false
      $scope.address = address

    Wallet.addAddressOrPrivateKey(addressOrPrivateKey, needsBip38, success, error)

  # Transfer funds

  $scope.transfer = () ->
    $scope.sweeping = true

    success = () ->
      $scope.sweeping = false
      $modalInstance.dismiss ""
      $state.go("wallet.common.transactions", {accountIndex: $scope.fields.account.index})

    error = (error) ->
      $scope.sweeping = false
      Wallet.displayError(error)

    Wallet.transaction(success, error).sweep($scope.address, $scope.fields.account.index)

  # Misc functions

  $scope.goToTransfer = () ->
    $scope.step = 3

  $scope.cameraOn = () ->
    $scope.cameraRequested = true

  $scope.cameraOff = () ->
    $scope.cameraIsOn = false
    $scope.cameraRequested = false

  $scope.processURLfromQR = (url) ->
    $scope.fields.addressOrPrivateKey = $scope.parseBitcoinUrl(url)
    $scope.cameraOff()

  $scope.parseBitcoinUrl = (url) ->
    url = url.split('bitcoin:')
    return url[url.length - 1]

  $scope.close = () ->
    $modalInstance.dismiss ""
