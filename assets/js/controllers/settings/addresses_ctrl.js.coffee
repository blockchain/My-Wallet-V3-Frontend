@SettingsAddressesCtrl = ($scope, Wallet, $translate, $modal) ->
  $scope.legacyAddresses = Wallet.legacyAddresses
  $scope.accounts = Wallet.accounts
  $scope.display = {archived: false, account_dropdown_open: false}
  
  $scope.open = (request) ->
    Wallet.clearAlerts()
    modalInstance = $modal.open(
      templateUrl: "partials/request"
      controller: RequestCtrl
      resolve:
        request: -> request
    )
    
  $scope.clear = (request) ->
    Wallet.cancelPaymentRequest(request.account, request.address)
    
  $scope.accept = (request) ->
    Wallet.acceptPaymentRequest(request.account, request.address)
    
  $scope.generateRequestForAccount = (idx) ->
    request = Wallet.generatePaymentRequestForAccount(idx, 0)
    modalInstance = $modal.open(
      templateUrl: "partials/request"
      controller: RequestCtrl
      resolve:
        request: -> request
    )

  $scope.archive = (address) ->
    Wallet.archive(address)
    
  $scope.unarchive = (address) ->
    Wallet.unarchive(address)
    
  $scope.delete = (address) ->
    $translate("LOSE_ACCESS").then (translation) ->    
      if confirm translation
        Wallet.deleteLegacyAddress(address)
        
        
  #################################
  #           Private             #
  #################################
  
  $scope.didLoad = () ->
    $scope.requests = Wallet.paymentRequests
    
  # First load:      
  $scope.didLoad()