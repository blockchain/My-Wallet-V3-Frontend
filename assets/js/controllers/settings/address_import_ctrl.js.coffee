walletApp.controller "AddressImportCtrl", ($scope, $log, Wallet, $modalInstance, $translate, $state, $timeout) ->

  $scope.settings = Wallet.settings
  $scope.accounts = Wallet.accounts
  $scope.address = null

  $scope.step = 1
  $scope.BIP38 = false

  $scope.status =
    busy: false
    sweeping: false
    cameraIsOn: false

  $scope.fields =
    addressOrPrivateKey: ''
    bip38passphrase: ''
    account: null

  $scope.$watchCollection "accounts()", (newValue) ->
    $scope.fields.account = Wallet.accounts()[0]

  $scope.isValidAddressOrPrivateKey = (val) ->
    Wallet.my.isValidAddress(val) || Wallet.my.isValidPrivateKey(val)

  # Import address or private key

  $scope.import = () ->
    $scope.status.busy = true

    addressOrPrivateKey = $scope.fields.addressOrPrivateKey.trim()
    bip38passphrase = $scope.fields.bip38passphrase.trim()

    success = (address) ->
      $scope.status.busy = false
      $scope.address = address
      $scope.step = 2

    error = (err, address=null) ->
      $scope.status.busy = false
      return unless err?

      switch err
        when 'presentInWallet'
          $scope.importForm.privateKey.$setValidity('present', false)
        when 'wrongBipPass'
          $scope.importForm.bipPassphrase.$setValidity('wrong', false)
        when 'needsBip38'
          $scope.BIP38 = true

    $timeout () ->
      Wallet.addAddressOrPrivateKey(
        addressOrPrivateKey, bip38passphrase, success, error
      )
    , 250

  # Transfer funds

  $scope.transfer = () ->
    $scope.status.sweeping = true

    success = () ->
      $scope.status.sweeping = false
      $modalInstance.dismiss ""
      $state.go("wallet.common.transactions", {accountIndex: $scope.fields.account.index})

    error = (error) ->
      $scope.status.sweeping = false
      Wallet.displayError(error)

    Wallet.transaction(success, error).sweep($scope.address, $scope.fields.account.index)

  # Misc functions

  $scope.goToTransfer = () ->
    $scope.step = 3

  $scope.onError = (error) ->
    # This never gets called...
    $translate("CAMERA_PERMISSION_DENIED").then (translation) ->
      Wallet.displayWarning(translation)

  $scope.cameraOn = () ->
    $scope.cameraRequested = true

  $scope.cameraOff = () ->
    $scope.status.cameraIsOn = false
    $scope.cameraRequested = false

  $scope.processURLfromQR = (url) ->
    $scope.fields.addressOrPrivateKey = $scope.parseBitcoinUrl(url)
    $scope.cameraOff()
    valid = $scope.isValidAddressOrPrivateKey($scope.fields.addressOrPrivateKey)
    $scope.importForm.privateKey.$setValidity('isValid', valid)

  $scope.parseBitcoinUrl = (url) ->
    url = url.split('bitcoin:')
    return url[url.length - 1]

  $scope.close = () ->
    $modalInstance.dismiss ""
