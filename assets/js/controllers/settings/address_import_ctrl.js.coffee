@AddressImportCtrl = ($scope, $log, Wallet, $modalInstance, $translate, $state) ->
  
  $scope.step = 1
  $scope.legacyAddresses  = Wallet.legacyAddresses
  $scope.BIP38 = null
  $scope.bip38passphrase = ""
  $scope.sweeping = false
    
  $scope.fields = {addressOrPrivateKey: "", account: null}
  
  $scope.$watchCollection "accounts", (newValue) ->
    $scope.fields.account = Wallet.accounts[0]
  
  $scope.errors = {invalidInput: null, addressPresentInWallet: null, incorrectBip38Password: null}
  
  $scope.isValid = () ->
    tally = 0
    for key, value of $scope.errors
      if $scope.errors[key]
        tally++
    return tally == 0
        
  $scope.address = null
  $scope.accounts = Wallet.accounts
  
  $scope.close = () ->
    $modalInstance.dismiss ""
  
  $scope.validate = () ->
    if $scope.BIP38
      wrongPassword = () ->
        $scope.errors.incorrectBip38Password = true
      
      $scope.bip38callback($scope.bip38passphrase, wrongPassword)
    else
      success = (address)->
        $scope.address = address
        $scope.step = 2
    
      errors = (errors, address) ->
        $scope.address = address or null
      
        # We basically just want to do $scope.errors = errors, but AngularJS would
        # stop monitoring in that case:
        for key, value in $scope.errors
          $scope.errors[key] = undefined
        
        for error, value of errors
          $scope.errors[error] = value
        
      needsBip38 = (callback) ->
        $scope.bip38callback = callback
        $scope.BIP38 = true
    
      addressOrPrivateKey = $scope.fields.addressOrPrivateKey.trim()
      Wallet.addAddressOrPrivateKey(addressOrPrivateKey, needsBip38, success, errors)
    
  $scope.goToTransfer = () ->
    $scope.step = 3
  
  $scope.transfer = () ->
    $scope.sweeping = true
    
    success = () ->
      $scope.sweeping = false
      $modalInstance.dismiss ""
      $state.go("wallet.common.transactions", {accountIndex: $scope.fields.account.index})
    
    error = (error) ->
      $scope.sweeping = false
      Wallet.displayError(error)
      
    Wallet.transaction(success, error).sweepLegacyAddressToAccount($scope.address, $scope.fields.account.index)