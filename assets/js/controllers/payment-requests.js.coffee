@PaymentRequestsCtrl = ($scope, Wallet, $modal) ->
  $scope.settings = Wallet.settings

  #################################
  #           Private             #
  #################################

  $scope.didLoad = () ->
    $scope.requests = Wallet.paymentRequests
    
  $scope.open = (request) ->
    modalInstance = $modal.open(
      templateUrl: "partials/request"
      controller: RequestCtrl
      resolve:
        request: -> request
    )

  # First load:      
  $scope.didLoad()


  