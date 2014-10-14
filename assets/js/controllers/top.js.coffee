@TopCtrl = ($scope, Wallet, $modal, $stateParams) ->
  $scope.settings = Wallet.settings
  
  $scope.request = () ->
    modalInstance = $modal.open(
      templateUrl: "partials/request"
      controller: RequestCtrl
      resolve:
        request: null
    )
    
  $scope.send = () ->
    modalInstance = $modal.open(
      templateUrl: "partials/send"
      controller: SendCtrl
    )
  
  
  #################################
  #           Private             #
  #################################
    
  $scope.didLoad = () ->
    $scope.status = Wallet.status
    $scope.total_btc = Wallet.total_btc
    $scope.total_fiat = Wallet.total_fiat
    
    $scope.accountIndex = $stateParams.accountIndex

  
  # First load:      
  $scope.didLoad()