@PaymentRequestsCtrl = ($scope, Wallet) ->
  $scope.settings = Wallet.settings

  #################################
  #           Private             #
  #################################

  $scope.didLoad = () ->
    $scope.requests = Wallet.paymentRequests

  # First load:      
  $scope.didLoad()


  