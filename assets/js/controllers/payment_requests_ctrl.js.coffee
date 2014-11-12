@PaymentRequestsCtrl = ($scope, Wallet, $modal) ->

  $scope.open = (request) ->
    Wallet.clearAlerts()
    modalInstance = $modal.open(
      templateUrl: "partials/request"
      controller: RequestCtrl
      resolve:
        request: -> request
    )

  #################################
  #           Private             #
  #################################
  
  $scope.didLoad = () ->
    $scope.requests = Wallet.paymentRequests

  # First load:      
  $scope.didLoad()