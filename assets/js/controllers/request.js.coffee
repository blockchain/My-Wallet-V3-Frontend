@RequestCtrl = ($scope, Wallet, $modalInstance, $log, destination, $translate, $stateParams) ->  
  $scope.accounts = Wallet.accounts
  $scope.legacyAddresses = Wallet.legacyAddresses
  $scope.destinations = []
  $scope.receiveAddress = null
  
  $scope.currencies = angular.copy(Wallet.currencies)
  
  for currency in $scope.currencies
    currency.type = "Fiat"
    
  btc = {code: "BTC", type: "Crypto"}  
  $scope.currencies.unshift btc
  
  $scope.fields = {to: null, amount: "0", currency: btc, label: ""}  
      
  for account in $scope.accounts
    item = angular.copy(account)
    item.type = "Accounts" 
    $scope.destinations.push item
    
    if destination == account
      $scope.fields.to = item
  
  for address in $scope.legacyAddresses 
    if address.active
      item = angular.copy(address)
      item.type = "Imported Addresses"
      $scope.destinations.push item
      
  $scope.alerts = Wallet.alerts
    

  
      
  $scope.closeAlert = (alert) ->
    Wallet.closeAlert(alert)
      
  $scope.close = () ->
    Wallet.clearAlerts()
    $modalInstance.dismiss ""
    
  
  #################################
  #           Private             #
  #################################
  
  $scope.$watchCollection "destinations", () ->
    idx = Wallet.getDefaultAccountIndex()
    if !$scope.fields.to? && $scope.accounts.length > 0
      if $stateParams.accountIndex == "accounts" || !$stateParams.accountIndex? # The latter is for Jasmine
        # Nothing to do, just use the default index
      else 
        idx = parseInt($stateParams.accountIndex)
      $scope.fields.to = $scope.accounts[idx]
        
  $scope.$watch "fields.to", () ->
    $scope.formIsValid = $scope.validate()
    amount = $scope.parseAmount()
        
    if $scope.fields.to? && $scope.fields.to.address?
      $scope.setPaymentRequestURL($scope.fields.to.address, amount)
    else if $scope.fields.label == ""
      idx = $scope.fields.to.index
      $scope.receiveAddress = Wallet.getReceivingAddressForAccount(idx)
      $scope.setPaymentRequestURL($scope.receiveAddress, amount)
        
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
    if $scope.fields.to?
      if $scope.fields.to.address?
        $scope.setPaymentRequestURL($scope.fields.to.address, amount)
      else if $scope.formIsValid        
        $scope.setPaymentRequestURL($scope.receiveAddress, amount)
        
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