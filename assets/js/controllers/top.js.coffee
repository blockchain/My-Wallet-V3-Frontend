@TopCtrl = ($scope, Wallet, $modal) ->
  
  $scope.request = () ->
    modalInstance = $modal.open(
      templateUrl: "partials/request"
      controller: RequestCtrl
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
    $scope.totals = Wallet.totals
  
  # First load:      
  $scope.didLoad()