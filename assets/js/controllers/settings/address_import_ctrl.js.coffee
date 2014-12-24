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
    
        
    Wallet.addAddressOrPrivateKey($scope.fields.addressOrPrivateKey.trim(), $scope.errors, success)
    
  $scope.goToTransfer = () ->
    $scope.step = 3
  
  $scope.transfer = () ->
    Wallet.sweepLegacyToAccount($scope.address, $scope.fields.account.index)
    $modalInstance.dismiss ""
    $state.go("transactions", {accountIndex: $scope.fields.account.index})

