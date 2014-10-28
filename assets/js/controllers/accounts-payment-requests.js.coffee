@AccountsPaymentRequestsCtrl = ($scope, Wallet, $state,$stateParams, $modal) ->
  $scope.status    = Wallet.status
  $scope.totals = Wallet.totals
  $scope.settings = Wallet.settings
  
  $scope.selectedAccountIndex = $stateParams.accountIndex
    
  $scope.createAccount = () ->
    Wallet.createAccount()
    $state.go("transactions", {accountIndex: Wallet.accounts.length - 1})

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
    $scope.accounts = Wallet.accounts
    $scope.requests = Wallet.paymentRequests
    

  # First load:      
  $scope.didLoad()