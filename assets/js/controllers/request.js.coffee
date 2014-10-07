@RequestCtrl = ($scope, Wallet, MyWallet, $modalInstance, $log, $timeout) ->
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
    
    if $scope.request.address && $scope.requestIsValid && MyWallet.mockShouldReceiveNewTransaction != undefined
      # Check if MyWallet is a mock or the real thing. The mock will simulate payment 
      # after 10 seconds of inactivity. Refactor if this breaks any of the
      # request controller spects.
      
      if $scope.mockTimer == undefined || $timeout.cancel($scope.mockTimer)      
        $scope.mockTimer = $timeout((->
          MyWallet.mockShouldReceiveNewTransaction($scope.request.address, "1Q9abeFt9drSYS1XjwMjR51uFH2csh86iC" ,$scope.request.amount * 100000000, "")
        ), 10000)  
      
  $scope.validate = (request) ->
    return false if request.to == null
    return false if request.amount == 0
    
    return true
  