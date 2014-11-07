@TopCtrl = ($scope, Wallet, $modal, $stateParams) ->
  $scope.settings = Wallet.settings
  
  $scope.request = () ->
    Wallet.clearAlerts()
    modalInstance = $modal.open(
      templateUrl: "partials/request"
      controller: RequestCtrl
      resolve:
        request: null
    )
    
  $scope.send = () ->
    Wallet.clearAlerts()
    modalInstance = $modal.open(
      templateUrl: "partials/send"
      controller: SendCtrl
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