@TopCtrl = ($scope, Wallet, $modal, $stateParams) ->
  $scope.settings = Wallet.settings
  $scope.isBitCurrency = Wallet.isBitCurrency
  
  $scope.request = () ->
    Wallet.clearAlerts()
                        
    modalInstance = $modal.open(
      templateUrl: "partials/request.jade"
      controller: RequestCtrl
      resolve:
        destination: -> null
      windowClass: "bc-modal"
    )
    if modalInstance?
      modalInstance.opened.then () ->
        Wallet.store.resetLogoutTimeout()
    
  $scope.send = () ->
    Wallet.clearAlerts()
    modalInstance = $modal.open(
      templateUrl: "partials/send.jade"
      controller: SendCtrl
      resolve:
        paymentRequest: ->
          {address: "", amount: ""}
      windowClass: "bc-modal"

    )
    if modalInstance?
      modalInstance.opened.then () ->
        Wallet.store.resetLogoutTimeout()
  
  $scope.getTotal = (index) ->
    return null if $scope.total(index) == null
    if not $scope.settings.multiAccount 
      return null if $scope.total('imported') == null
      return $scope.total('imported') + $scope.total(index)
    return $scope.total(index)
    
  #################################
  #           Private             #
  #################################
    
  $scope.didLoad = () ->
    $scope.status = Wallet.status
    $scope.total = Wallet.total
    
    $scope.accountIndex = $stateParams.accountIndex

  # First load:      
  $scope.didLoad()
