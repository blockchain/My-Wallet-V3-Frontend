@SettingsAddressesCtrl = ($scope, Wallet, $translate, $modal) ->
  $scope.legacyAddresses = Wallet.legacyAddresses
  $scope.accounts = Wallet.accounts
  $scope.display = {archived: false, account_dropdown_open: false}  
  
  $scope.hdAddresses = Wallet.hdAddresses
  
  $scope.clear = (request) ->
    Wallet.cancelPaymentRequest(request.account, request.address)
    
  $scope.archive = (address) ->
    Wallet.archive(address)
    
  $scope.unarchive = (address) ->
    Wallet.unarchive(address)
    
  $scope.delete = (address) ->
    $translate("LOSE_ACCESS").then (translation) ->    
      if confirm translation
        Wallet.deleteLegacyAddress(address)
        
  $scope.importAddress = () ->
    Wallet.clearAlerts()
    modalInstance = $modal.open(
      templateUrl: "partials/settings/import-address"
      controller: AddressImportCtrl
      windowClass: "blockchain-modal"
    )
    
  $scope.transfer = (address) ->
    $modal.open(
      templateUrl: "partials/send"
      controller: SendCtrl
      resolve:
        paymentRequest: -> 
          {fromAddress: address, amount: 0, toAccount: Wallet.accounts[Wallet.getDefaultAccountIndex()]}
    )
        
        
  #################################
  #           Private             #
  #################################
  
  $scope.didLoad = () ->
    $scope.requests = Wallet.paymentRequests
    
  # First load:      
  $scope.didLoad()