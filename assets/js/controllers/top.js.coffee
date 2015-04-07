@TopCtrl = ($scope, Wallet, $modal, $stateParams) ->
  $scope.settings = Wallet.settings
  
  $scope.request = () ->
    Wallet.clearAlerts()
                        
    modalInstance = $modal.open(
      templateUrl: "partials/request.jade"
      controller: RequestCtrl
      resolve:
        destination: -> null
      windowClass: "blockchain-modal"
    )
    
  $scope.send = () ->
    Wallet.clearAlerts()
    modalInstance = $modal.open(
      templateUrl: "partials/send.jade"
      controller: SendCtrl
      resolve:
        paymentRequest: ->
          {address: "", amount: ""}
      windowClass: "blockchain-modal"

    )
  
  $scope.getTotal = (index) ->
    add = if not $scope.settings.multiAccount then $scope.total('imported') else 0
    return $scope.total(index) + add
  #################################
  #           Private             #
  #################################
    
  $scope.didLoad = () ->
    $scope.status = Wallet.status
    $scope.total = Wallet.total
    
    $scope.accountIndex = $stateParams.accountIndex

  # First load:      
  $scope.didLoad()