@TopCtrl = ($scope, Wallet, $modal, $stateParams) ->
  $scope.settings = Wallet.settings
  
  $scope.request = () ->
    Wallet.clearAlerts()
                        
    modalInstance = $modal.open(
      templateUrl: "partials/request.jade"
      controller: RequestCtrl
      resolve:
        destination: -> null
      windowClass: "bc-modal"
    )
    
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
  
  $scope.getTotal = (index) ->
    return null if $scope.total(index) == null
    if not $scope.settings.multiAccount 
      return null if $scope.total('imported') == null
      return $scope.total('imported') + $scope.total(index)
    return $scope.total(index)

  $scope.shouldShowFiat = () ->
    if $scope.settings.displayCurrency?
      for btcCur in ['BTC', 'mBTC', 'bits']
        return false if btcCur == $scope.settings.displayCurrency.code
    return true

  $scope.btcCurrencyCodeIs = (code) ->
    if $scope.settings.btcCurrency?
      return code == $scope.settings.btcCurrency.code
    else return false
    
  #################################
  #           Private             #
  #################################
    
  $scope.didLoad = () ->
    $scope.status = Wallet.status
    $scope.total = Wallet.total
    
    $scope.accountIndex = $stateParams.accountIndex

  # First load:      
  $scope.didLoad()
