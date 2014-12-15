@RequestCtrl = ($scope, Wallet, MyWallet, $modalInstance, $log, $timeout, request, $stateParams, $translate) ->  
  $scope.accounts = Wallet.accounts
  $scope.legacyAddresses = Wallet.legacyAddresses
  $scope.destinations = []
      
  for account in $scope.accounts
    item = angular.copy(account)
    item.type = "Accounts" 
    $scope.destinations.push item
  
  for address in $scope.legacyAddresses 
    if address.active
      item = angular.copy(address)
      item.type = "Imported Addresses"
      $scope.destinations.push item
  
  $scope.alerts = Wallet.alerts
    
  $scope.currencies = angular.copy(Wallet.currencies)
  
  for currency in $scope.currencies
    currency.type = "Fiat"
    
  btc = {code: "BTC", type: "Crypto"}  
  $scope.currencies.unshift btc
  
  $scope.fields = {to: null, amount: "0", currency: btc, label: ""}  
      
  $scope.closeAlert = (alert) ->
    Wallet.closeAlert(alert)
      
  $scope.close = () ->
    Wallet.clearAlerts()
    $modalInstance.dismiss ""
    
  $scope.save = () ->
    Wallet.clearAlerts()
    $modalInstance.dismiss ""
    
  $scope.cancel = () ->
    if $scope.paymentRequest
      index = $scope.accounts.indexOf($scope.fields.to)
      address = $scope.paymentRequest.address
      if Wallet.cancelPaymentRequest(index, address)
        $scope.paymentRequest = null 
      else
        $translate("PAYMENT_REQUEST_CANNOT_CANCEL").then (translation) ->
          Wallet.displayError(translation)
    
    if $scope.mockTimer != undefined
      $timeout.cancel($scope.mockTimer) 
      
    Wallet.clearAlerts()  
    $modalInstance.dismiss ""
    
  $scope.accept = () ->
    Wallet.acceptPaymentRequest($scope.accounts.indexOf($scope.fields.to), $scope.paymentRequest.address)
    
    if $scope.mockTimer != undefined
      $timeout.cancel($scope.mockTimer)
    
    Wallet.clearAlerts()
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
                
        $scope.fields = {amount: numeral(request.amount).divide(100000000).format("0.[00000000]"), currency: btc, label: request.label}
        $scope.fields.to = $scope.accounts[request.account]
        
      $scope.listenerForPayment = $scope.$watch "paymentRequest.paid", (val,before) ->
        if val != 0 && before != val && $scope.paymentRequest
          if val == $scope.paymentRequest.amount
            $modalInstance.dismiss ""
        
          else if val > 0 && val < $scope.paymentRequest.amount
            # Mock pays the remainder after 10 seconds
            if MyWallet.mockShouldReceiveNewTransaction != undefined
              $scope.mockTimer = $timeout((->
                MyWallet.mockShouldReceiveNewTransaction($scope.paymentRequest.address, "1Q9abeFt9drSYS1XjwMjR51uFH2csh86iC" , $scope.paymentRequest.amount - 100000000, "")
              ), 10000)
      
  $scope.$watch "fields.to", () ->
    $scope.formIsValid = $scope.validate()
    amount = $scope.parseAmount()
        
    if $scope.fields.to? && $scope.fields.to.address?
      $scope.setPaymentRequestURL($scope.fields.to.address, amount)
    else if parseInt($scope.fields.amount) == 0 && $scope.fields.label == ""
      idx = $scope.fields.to.index
      $scope.paymentRequest = Wallet.generateOrReuseEmptyPaymentRequestForAccount(idx)
      $scope.setPaymentRequestURL($scope.paymentRequest.address, amount)
        
  $scope.parseAmount = () ->
    if $scope.fields.currency == undefined
      return 0
    else if $scope.fields.currency.code == "BTC"
      return parseInt(numeral($scope.fields.amount).multiply(100000000).format("0"))
    else
      return Wallet.fiatToSatoshi($scope.fields.amount, $scope.fields.currency.code)
        
  $scope.$watch "fields.amount + fields.currency.code + fields.label", (oldValue, newValue) ->
    $scope.formIsValid = $scope.validate()
        
    amount = $scope.parseAmount()    
    if $scope.fields.to? && $scope.fields.to.address?
      $scope.setPaymentRequestURL($scope.fields.to.address, amount)
      
    if $scope.paymentRequest && $scope.formIsValid
      if oldValue isnt newValue
        Wallet.updatePaymentRequest($scope.fields.to.index, $scope.paymentRequest.address, amount, $scope.fields.label)
        
      $scope.setPaymentRequestURL($scope.paymentRequest.address, amount)
        
      if MyWallet.mockShouldReceiveNewTransaction != undefined && request == undefined
        # Check if MyWallet is a mock or the real thing. The mock will simulate payment 
        # after 10 seconds of inactivity. Refactor if this breaks any of the
        # request controller spects.
        
      
        if $scope.mockTimer == undefined || $timeout.cancel($scope.mockTimer)                
          $scope.mockTimer = $timeout((->
            MyWallet.mockShouldReceiveNewTransaction($scope.paymentRequest.address, "1Q9abeFt9drSYS1XjwMjR51uFH2csh86iC" ,100000000, "")
          ), 10000)  
        
  $scope.setPaymentRequestURL = (address, amount) ->
    $scope.paymentRequestAddress = address
    $scope.paymentRequestURL = "bitcoin:" + address
    if amount > 0
      $scope.paymentRequestURL += "?amount=" + numeral(amount).divide(100000000)

  $scope.validate = () ->
    return false if $scope.fields.to == null
    return false if isNaN(parseFloat($scope.fields.amount))
    return false if String(parseFloat($scope.fields.amount)) != $scope.fields.amount
    return false if parseFloat($scope.fields.amount) < 0.0
    
    return true
  
