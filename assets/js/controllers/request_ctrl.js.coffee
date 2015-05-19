@RequestCtrl = ($scope, Wallet, $modalInstance, $log, destination, $translate, $stateParams, filterFilter) ->  
  $scope.accounts = Wallet.accounts
  $scope.legacyAddresses = Wallet.legacyAddresses
  $scope.destinations = []
  $scope.receiveAddress = null
  $scope.status = Wallet.status
  $scope.settings = Wallet.settings
  
  $scope.currencies = angular.copy(Wallet.currencies)
  
  for currency in $scope.currencies
    currency.type = "Fiat"
    
  btc = {code: "BTC", type: "Crypto"}  
  $scope.currencies.unshift btc
  
  $scope.fields = {to: null, amount: "0", currency: Wallet.settings.currency, label: ""}  
      
  for account in $scope.accounts
    item = angular.copy(account)
    item.type = "Accounts" 
    item.multiAccount = if item.index == 0 then false else true

    unless item.index? && !item.active
      $scope.destinations.push item
    
    if destination == account
      $scope.fields.to = item
  
  for address in $scope.legacyAddresses 
    if address.active
      item = angular.copy(address)
      item.type = "Imported Addresses"
      item.multiAccount = false
      $scope.destinations.push item
      
  $scope.alerts = Wallet.alerts
    

  $scope.determineLabel = (origin) ->
    label = origin.label || origin.address
    return label
      
  $scope.closeAlert = (alert) ->
    Wallet.closeAlert(alert)
      
  $scope.close = () ->
    Wallet.clearAlerts()
    $modalInstance.dismiss ""
    
  $scope.numberOfActiveAccountsAndLegacyAddresses = () -> 
    return filterFilter(Wallet.accounts, {active: true}).length + filterFilter(Wallet.legacyAddresses, {active: true}).length
  
  #################################
  #           Private             #
  #################################
  
  $scope.getFilter = (search) ->
    filter =
      label: search
    filter.multiAccount = false if not $scope.settings.multiAccount
    return filter
  
  $scope.$watchCollection "destinations", () ->
    idx = Wallet.getDefaultAccountIndex()
    if !$scope.fields.to? && $scope.accounts.length > 0
      if $stateParams.accountIndex == "accounts" || !$stateParams.accountIndex? # The latter is for Jasmine
        # Nothing to do, just use the default index
      else 
        idx = parseInt($stateParams.accountIndex)
      $scope.fields.to = $scope.accounts[idx]
        
  $scope.$watch "fields.to.index + fields.to.address + status.didInitializeHD", () ->
    $scope.formIsValid = $scope.validate()
    amount = $scope.parseAmount()
        
    if $scope.fields.to? && $scope.fields.to.address?
      $scope.setPaymentRequestURL($scope.fields.to.address, amount)
    else if $scope.fields.label == "" && $scope.status.didInitializeHD
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
    $scope.paymentRequestAmount = amount
    
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