@RequestCtrl = ($scope, Wallet, MyWallet, $modalInstance, $log, $timeout, request, $stateParams) ->
  $scope.accounts = Wallet.accounts
  
  $scope.alerts = []
  
  $scope.fields = {to: null, amount: 0}
  
  
  
  $scope.closeAlert = (index) ->
    $scope.alerts.splice index, 1
    return
    
  if request == undefined || request == null  
    # Managed by this controller, amount in BTC:
    $scope.fields = {to: null, amount: 0.0}  
    # Managed by Wallet service, amounts in Satoshi, has payment information:
    $scope.paymentRequest = null 
  
  $scope.close = () ->
    $modalInstance.dismiss ""
    
  $scope.save = () ->
    $modalInstance.dismiss ""
    
  $scope.cancel = () ->
    if $scope.paymentRequest
      Wallet.cancelPaymentRequest($scope.accounts.indexOf($scope.fields.to), $scope.paymentRequest.address)
      $scope.paymentRequest = null 
    
    if $scope.mockTimer != undefined
      $timeout.cancel($scope.mockTimer) 
      
    $modalInstance.dismiss ""
    
  $scope.accept = () ->
    Wallet.acceptPaymentRequest($scope.accounts.indexOf($scope.fields.to), $scope.paymentRequest.address)
    
    if $scope.mockTimer != undefined
      $timeout.cancel($scope.mockTimer)
      
    $modalInstance.dismiss ""
  
  #################################
  #           Private             #
  #################################
  
  # Set initial form values:
  $scope.$watchCollection "accounts", () ->
    if $scope.fields.to == null && $scope.accounts.length > 0
      if request 
        # Open an existing request
        $scope.paymentRequest = request
        
        $scope.fields = {amount: request.amount / 100000000 }
        
        $scope.fields.to = Wallet.accountForPaymentRequest(request)
      else
        # Making a new request; default to current or first account:
        if $stateParams.accountIndex == undefined || $stateParams.accountIndex == null || $stateParams.accountIndex == ""
          $scope.fields.to = $scope.accounts[0]
        else 
          $scope.fields.to = $scope.accounts[parseInt($stateParams.accountIndex)]
      
  $scope.$watch "fields.to", () ->
    $scope.formIsValid = $scope.validate()
    # TODO: warn user if they try to change this after a request has been created
        
  $scope.$watch "fields.amount", (newValue, oldValue) ->
    $scope.formIsValid = $scope.validate()
    
    if $scope.paymentRequest == null && $scope.formIsValid
      $scope.paymentRequest =  Wallet.generatePaymentRequestForAccount($scope.accounts.indexOf($scope.fields.to), parseInt($scope.fields.amount * 100000000))

    if $scope.paymentRequest && $scope.formIsValid
      if oldValue isnt newValue && newValue > 0
        Wallet.updatePaymentRequest($scope.accounts.indexOf($scope.fields.to), $scope.paymentRequest.address, parseInt($scope.fields.amount * 100000000))
        
      $scope.paymentRequest.URL = "bitcoin:" + $scope.paymentRequest.address + "?amount=" + $scope.paymentRequest.amount / 100000000.0
        
      if MyWallet.mockShouldReceiveNewTransaction != undefined && request == undefined
        # Check if MyWallet is a mock or the real thing. The mock will simulate payment 
        # after 10 seconds of inactivity. Refactor if this breaks any of the
        # request controller spects.
        
      
        if $scope.mockTimer == undefined || $timeout.cancel($scope.mockTimer)                
          $scope.mockTimer = $timeout((->
            MyWallet.mockShouldReceiveNewTransaction($scope.paymentRequest.address, "1Q9abeFt9drSYS1XjwMjR51uFH2csh86iC" ,100000000, "")
          ), 10000)  
        
  $scope.listenerForPayment = $scope.$watch "paymentRequest.paid", (val) ->
    if $scope.paymentRequest != null
      if val == $scope.paymentRequest.amount
        $scope.alerts.push {type: "success", msg: "Payment received"}
        
        $scope.listenerForPayment()
      else if val > 0 && val < $scope.paymentRequest.amount
        $scope.alerts.push {msg: "Incomplete payment: " + val / 100000000 + " out of " + $scope.paymentRequest.amount / 100000000 +  " BTC" }
      
        # Mock pays the remainder after 10 seconds
        if MyWallet.mockShouldReceiveNewTransaction != undefined
          $scope.mockTimer = $timeout((->
            MyWallet.mockShouldReceiveNewTransaction($scope.paymentRequest.address, "1Q9abeFt9drSYS1XjwMjR51uFH2csh86iC" , $scope.paymentRequest.amount - 100000000, "")
          ), 10000)
      
      else if val > $scope.paymentRequest.amount
        $scope.alerts.push {msg: "Paid too much: " + val / 100000000 + " instead of " + $scope.paymentRequest.amount / 100000000 +  " BTC" }
      
  $scope.validate = () ->
    return false if $scope.fields.to == null
    return false if parseFloat($scope.fields.amount) == 0.0
    
    return true
  
