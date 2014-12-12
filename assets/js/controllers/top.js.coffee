@TopCtrl = ($scope, Wallet, $modal, $stateParams) ->
  $scope.settings = Wallet.settings
  
  $scope.request = () ->
    Wallet.clearAlerts()
      
      
    if !$scope.accountIndex? || $scope.accountIndex == ""
      request = Wallet.generateOrReuseEmptyPaymentRequestForAccount(0)
    else if $scope.accountIndex == "imported"
      # Currently no way to select a random legacy address:
      request = Wallet.generateOrReuseEmptyPaymentRequestForAccount(0)
    else
      request = Wallet.generateOrReuseEmptyPaymentRequestForAccount(parseInt($scope.accountIndex))
            
    modalInstance = $modal.open(
      templateUrl: "partials/request"
      controller: RequestCtrl
      resolve:
        request: request
      windowClass: "blockchain-modal"
    )
    
  $scope.send = () ->
    Wallet.clearAlerts()
    modalInstance = $modal.open(
      templateUrl: "partials/send"
      controller: SendCtrl
      resolve:
        paymentRequest: ->
          {address: "", amount: ""}
      windowClass: "blockchain-modal"

    )
  
  #################################
  #           Private             #
  #################################
    
  $scope.didLoad = () ->
    $scope.status = Wallet.status
    $scope.total = Wallet.total
    
    $scope.accountIndex = $stateParams.accountIndex

  # First load:      
  $scope.didLoad()