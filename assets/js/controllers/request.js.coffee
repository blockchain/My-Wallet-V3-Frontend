@RequestCtrl = ($scope, Wallet, MyWallet, $modalInstance, $log, $timeout) ->
  $scope.accounts = Wallet.accounts
  
  $scope.alerts = []
  
  # Managed by this controller, amount in BTC:
  $scope.fields = {to: null, address: null, amount: 0.0}  
  # Managed by Wallet service, amounts in Satoshi, has payment information:
  $scope.paymentRequest = null 
  
  $scope.close = () ->
    $modalInstance.dismiss ""
  
  #################################
  #           Private             #
  #################################
  
  $scope.$watchCollection "accounts", () ->
    if $scope.fields.to == null && $scope.accounts.length > 0
      $scope.fields.to = $scope.accounts[0]
      
  $scope.$watch "fields.to", () ->
    $scope.formIsValid = $scope.validate()
    # TODO: warn user if they try to change this after a request has been created
        
  $scope.$watchCollection "[fields.amount]", () ->
    $scope.formIsValid = $scope.validate()
    
    if $scope.paymentRequest == null && $scope.formIsValid
      $scope.paymentRequest =  Wallet.generatePaymentRequestForAccount($scope.accounts.indexOf($scope.fields.to), $scope.fields.amount * 100000000)
    
    if $scope.paymentRequest && $scope.formIsValid
      Wallet.updatePaymentRequest($scope.accounts.indexOf($scope.fields.to), $scope.paymentRequest.address, $scope.fields.amount * 100000000)
        
      if MyWallet.mockShouldReceiveNewTransaction != undefined
        # Check if MyWallet is a mock or the real thing. The mock will simulate payment 
        # after 10 seconds of inactivity. Refactor if this breaks any of the
        # request controller spects.
        
      
        if $scope.mockTimer == undefined || $timeout.cancel($scope.mockTimer)                
          $scope.mockTimer = $timeout((->
            MyWallet.mockShouldReceiveNewTransaction($scope.paymentRequest.address, "1Q9abeFt9drSYS1XjwMjR51uFH2csh86iC" ,$scope.paymentRequest.amount, "")
          ), 10000)  
        
  $scope.listenerForPayment = $scope.$watch "paymentRequest.paid", (val) ->
    if val > 0
      $scope.alerts.push {type: "success", msg: "Payment received"}
      
      $scope.listenerForPayment()
      
      
      
  $scope.validate = () ->
    return false if $scope.fields.to == null
    return false if $scope.fields.amount == 0
    
    return true
  