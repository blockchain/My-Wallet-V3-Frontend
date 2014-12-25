@AddressImportCtrl = ($scope, $log, Wallet, $modalInstance, $translate, $state) ->
  
  $scope.step = 1
  $scope.legacyAddresses  = Wallet.legacyAddresses
    
  $scope.fields = {addressOrPrivateKey: "", account: null}
  
  $scope.$watchCollection "accounts", (newValue) ->
    $scope.fields.account = Wallet.accounts[0]
  
  $scope.errors = {}
  
  $scope.isValid = () ->
    Object.keys($scope.errors).length == 0
  
  $scope.address = null
  $scope.accounts = Wallet.accounts
  
  $scope.close = () ->
    $modalInstance.dismiss ""
  
  $scope.validate = () ->
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
    
    addressOrPrivateKey = $scope.fields.addressOrPrivateKey.trim()
    Wallet.addAddressOrPrivateKey(addressOrPrivateKey, success, errors)
    
  $scope.goToTransfer = () ->
    $scope.step = 3
  
  $scope.transfer = () ->
    Wallet.sweepLegacyToAccount($scope.address, $scope.fields.account.index)
    $modalInstance.dismiss ""
    $state.go("transactions", {accountIndex: $scope.fields.account.index})

