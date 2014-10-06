@RequestCtrl = ($scope, Wallet, $modalInstance) ->
  $scope.accounts = Wallet.accounts
  
  $scope.request = {to: null, address: null, amount: 0.0}  
  
  $scope.close = () ->
    $modalInstance.dismiss ""
  
  #################################
  #           Private             #
  #################################
  
  $scope.$watchCollection "accounts", () ->
    if $scope.request.to == null && $scope.accounts.length > 0
      $scope.request.to = $scope.accounts[0]
      
  $scope.$watchCollection "[request.to, request.amount]", () ->
    $scope.requestIsValid = $scope.validate($scope.request)
    
    if $scope.request.address == null && $scope.requestIsValid
      $scope.request.address = Wallet.generatePaymentRequestForAccount($scope.accounts.indexOf($scope.request.to)).address
      
  $scope.validate = (request) ->
    return false if request.to == null
    return false if request.amount == 0
    
    return true
  