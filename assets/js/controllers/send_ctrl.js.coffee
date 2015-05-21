@SendCtrl = ($scope, $log, Wallet, $modalInstance, $timeout, $state, $filter, $stateParams, $translate, paymentRequest, filterFilter) ->
  $scope.legacyAddresses = Wallet.legacyAddresses
  $scope.accounts = Wallet.accounts
  $scope.addressBook = Wallet.addressBook
  $scope.status = Wallet.status
  $scope.settings = Wallet.settings
  
  $scope.origins = []
  $scope.destinations = []  
  
  $scope.originsLoaded = false
  $scope.cameraIsOn = false
  
  
  $scope.sending = false # Sending in progress
  
  # getUserMedia is not supported by Safari and IE. 
  $scope.browserWithCamera = (navigator.getUserMedia || navigator.mozGetUserMedia ||  navigator.webkitGetUserMedia || navigator.msGetUserMedia) != undefined
    
  $scope.$watch "status.didLoadBalances + status.legacyAddressBalancesLoaded", ->
    if $scope.status.didLoadBalances && $scope.status.legacyAddressBalancesLoaded
      if $scope.origins.length == 0      
        for account in $scope.accounts
          item = angular.copy(account)
          item.type = "Accounts" 
          item.multiAccount = if item.index == 0 then false else true
          unless item.index? && !item.active
            $scope.origins.push item 
            $scope.destinations.push angular.copy(item) # https://github.com/angular-ui/ui-select/issues/656
  
        for address in $scope.legacyAddresses 
          if address.active
            item = angular.copy(address)
            item.type = "Imported Addresses"
            item.multiAccount = false
            $scope.destinations.push item
            unless address.isWatchOnlyLegacyAddress
              $scope.origins.push angular.copy(item)
        
        $scope.destinations.push({address: "", label: "", type: "External"})
        $scope.transaction.destination =  $scope.destinations.slice(-1)[0]
        $scope.originsLoaded = true
        
        $scope.errors.to = null
        if paymentRequest.address?
          $scope.applyPaymentRequest(paymentRequest)      
        else if paymentRequest.toAccount?
          $scope.transaction.destination = paymentRequest.toAccount
          $scope.transaction.from = paymentRequest.fromAddress
        
    
  # for address, label of $scope.addressBook
  #     item = {address: address, label: label}
  #     item.type = "Address book"
  #     $scope.destinations.push item
  
  # $scope.privacyGuard = false
    
  $scope.errors = {to: null, amount: null}
  $scope.success = {to: null, amount: null}
  
  $scope.alerts = Wallet.alerts
  
  $scope.isOpen = {currencies: false}
  
  $scope.fiatCurrency = Wallet.settings.currency
  $scope.btcCurrency = Wallet.settings.btcCurrency
          
  $scope.BTCtoFiat = (amount) ->
    Wallet.BTCtoFiat(amount, Wallet.settings.currency.code)
      
  $scope.determineLabel = (origin) ->
    label = origin.label || origin.address
    return label

  $scope.maxAndLabelForSelect = (select) ->
    return "" unless select?
    return "" unless select.selected?
    
    $scope.maxAndLabel(select.selected)
    
  $scope.maxAndLabel = (origin) ->
    
    label = $scope.determineLabel(origin)
    
    if origin.balance == undefined
      return label
    
    fees = Wallet.recommendedTransactionFee(origin, origin.balance)

    max_btc = numeral(origin.balance - fees).divide("100000000")
    
    max_btc = numeral(0) if max_btc < 0
    
    if $scope.transaction.currency == "BTC"
      return label + " (" + max_btc.format("0.[00000000]") + " BTC)"  
    else 
      return label + " (" + $scope.BTCtoFiat(max_btc) + " " + $scope.transaction.currency + ")"
  
  
  
  $scope.transaction = {
    from: null, 
    to: paymentRequest.address, 
    destination: null, 
    amount: paymentRequest.amount, 
    satoshi: 0, 
    currency: "BTC", 
    fee: 0
    note: ""
    publicNote: false
  }
      
  $scope.getFilter = (search) ->
    filter =
      label: search
    if not $scope.settings.multiAccount or $scope.numberOfActiveAccountsAndLegacyAddresses() == 1
      filter.multiAccount = false
    return filter
  
  $scope.hasZeroBalance = (origin) ->
    return origin.balance == 0.0

  $scope.onError = (error) -> 
    # This never gets called...
    $translate("CAMERA_PERMISSION_DENIED").then (translation) ->
      Wallet.displayWarning(translation)
  
  $scope.applyPaymentRequest = (paymentRequest) ->
      $scope.transaction.destination = $scope.destinations.slice(-1)[0]
      $scope.transaction.destination.address = paymentRequest.address
      $scope.transaction.destination.label = paymentRequest.address  
      if paymentRequest.amount  
        $scope.transaction.amount = paymentRequest.amount 
        $scope.transaction.currency = "BTC"    
      
      $scope.cameraOff()
      $scope.visualValidate()
      $scope.transactionIsValid = $scope.validate()
      
      $scope.updateToLabel()
  
  $scope.setMethod = (method) ->
    $scope.method = method
    return
    
  $scope.setMethod("BTC")
    
  $scope.processURLfromQR = (url) ->
    paymentRequest = Wallet.parsePaymentRequest(url)
    
    if paymentRequest.isValid
      $scope.applyPaymentRequest(paymentRequest)
    else
      $translate("QR_CODE_NOT_BITCOIN").then (translation) ->
        Wallet.displayWarning(translation)

      $log.error "Not a bitcoin QR code:" + url
      
      $timeout((->
        $scope.lookForQR()
      ), 2000)
         
  $scope.cameraOn = () ->
    $scope.cameraRequested = true
    
  $scope.cameraOff = () ->
    # $scope.qrStream.stop()
    $scope.cameraIsOn = false
    $scope.cameraRequested = false      
  
  $scope.close = () ->
    Wallet.clearAlerts()
    $modalInstance.dismiss ""
    
  $scope.nextAlternativeCurrency = () ->
    if $scope.transaction.currency == "BTC"
       return $scope.fiatCurrency.code
    else
      return "BTC" #$scope.btcCurrency.code
    
  $scope.toggleCurrency = () ->
    $scope.transaction.currency = $scope.nextAlternativeCurrency()
        
  $scope.numberOfActiveAccountsAndLegacyAddresses = () -> 
    return filterFilter(Wallet.accounts, {active: true}).length + filterFilter(Wallet.legacyAddresses, {active: true}).length

  $scope.send = () ->
    unless $scope.sending
      $scope.sending = true

      if $scope.transaction.publicNote
        publicNote = $scope.transaction.note
        if publicNote == ""
          publicNote = null
    
      transactionDidFailWithError = (message) ->
        if message
          Wallet.displayError(message)
        $scope.sending = false
      
      transactionDidFinish = (tx_hash) ->
        if not $scope.transaction.publicNote
          # Save private note, if any:
          note = $scope.transaction.note.trim()
          if note != ""
            Wallet.setNote({hash: tx_hash}, note)          

        $scope.sending = false
        
        Wallet.beep()
        
        $modalInstance.close ""
        if $scope.transaction.from.index?
          $state.go("wallet.common.transactions", {accountIndex: $scope.transaction.from.index })
        else
          $state.go("wallet.common.transactions", {accountIndex: "imported" })
          
      Wallet.clearAlerts()
  
      Wallet.transaction(transactionDidFinish, transactionDidFailWithError).send($scope.transaction.from, $scope.transaction.destination, numeral($scope.transaction.amount), $scope.transaction.currency, publicNote)
      return

  $scope.closeAlert = (alert) ->
    Wallet.closeAlert(alert)
    
  #################################
  #           Private             #
  #################################
      
  $scope.$watch "transaction.currency", (currency) ->
    if currency? && $scope.transaction.currencySelected && $scope.transaction.currencySelected.code != currency
      $scope.transaction.currencySelected = $filter("getByProperty")("code", currency, $scope.currencies)
        
  $scope.$watchCollection "destinations", () ->
    idx = Wallet.getDefaultAccountIndex()
    if !$scope.transaction.from? && $scope.accounts.length > 0
      if $stateParams.accountIndex == "accounts" || !$stateParams.accountIndex? # The latter is for Jasmine
        # Nothing to do, just use the default index
      else 
        idx = parseInt($stateParams.accountIndex)
      $scope.transaction.from = $scope.accounts[idx]
          
  $scope.$watchCollection "[transaction.destination, transaction.from, transaction.amount, transaction.currency]", () ->
    if $scope.transaction.currency == "BTC"
      $scope.transaction.satoshi = parseInt(numeral($scope.transaction.amount).multiply(100000000).format("0"))
    else
      $scope.transaction.satoshi = Wallet.fiatToSatoshi($scope.transaction.amount, $scope.transaction.currency)
    
    $scope.transaction.fee = Wallet.recommendedTransactionFee($scope.transaction.from, $scope.transaction.satoshi)     
    $scope.transactionIsValid = $scope.validate()
    
  $scope.$watch "transaction.from", () ->
    if $scope.transaction.from?
      $scope.from = $scope.transaction.from.label + " Account"
      $scope.visualValidate("from")
    
  $scope.$watch "transaction.destination", ()->
    $scope.updateToLabel()
    $scope.visualValidate("toAccount")
    $scope.transactionIsValid = $scope.validate()
      
  $scope.updateToLabel = () ->
    return unless $scope.transaction.destination?
    $scope.toLabel = $scope.transaction.destination.label
    if $scope.transaction.destination.index?
      $scope.toLabel += " Account"
      
  $scope.refreshDestinations = (query) ->
    return if $scope.destinations.length == 0
    last = $scope.destinations.slice(-1)[0]
    unless !query? || query == ""
       last.address = query
       last.label = query
    
    $scope.transactionIsValid = $scope.validate()  
    $scope.updateToLabel() 
    
    unless $scope.transaction.destination.type == "External"
      # Select the external account if it's the only match; otherwise when the user moves away from the field
      # the address will be forgotten. This is only an issue if the user selects an account first and then starts typing.
      for destination in $scope.destinations
        return if destination.type != "External" && destination.label.indexOf(query) != -1
      $scope.transaction.destination = last
      
      
    
  $scope.$watch "transaction.destination", ((newValue) ->
    $scope.visualValidate("to")
    ), true
  
    
  $scope.visualValidate = (blurredField) ->
    if blurredField == "to"
      return if $scope.destinations.length == 0
      
      $scope.errors.to = null
      $scope.success.to = null
      
      # If the user types a custom address but "forgets" to select it, it would otherwise be lost:
      if $scope.transaction.destination == "" && $scope.destinations.slice(-1)[0].type == "External"
        $scope.transaction.destination = $scope.destinations.slice(-1)[0]
      
      if $scope.transaction.destination == null  
      else if $scope.transaction.destination.type == "External"
        if $scope.transaction.destination.address == ""
        else if Wallet.isValidAddress($scope.transaction.destination.address)
          $scope.success.to = true
        else
          $translate("BITCOIN_ADDRESS_INVALID").then (translation) ->          
            $scope.errors.to = translation
      else
        if (
          $scope.transaction.destination.index? && ($scope.transaction.destination.index == $scope.transaction.from.index) ||
          $scope.transaction.destination.address? && ($scope.transaction.destination.address == $scope.transaction.from.address)
        
        )
          $translate("SAME_DESTINATION").then (translation) ->          
            $scope.errors.to = translation
    
    if blurredField == "amount" || blurredField == "currency"
      $scope.errors.amount = null
  
    transaction = $scope.transaction
    
    unless transaction.amount? && transaction.amount > 0
      if blurredField == "amount" 
        $scope.errors.amount = "Please enter amount"

    if $scope.originsLoaded && transaction.amount > 0 && !$scope.validateAmount()
      if blurredField == "amount" || blurredField == "from" || blurredField == "currency"
        if !$scope.validateAmountDecimals()
          $scope.errors.amount = "Maximum of " + $scope.allowedDecimals() + " decimal places"
        else
          $scope.errors.amount = "Insufficient funds"
    
    return 
    
  $scope.$watch "originsLoaded", ->
    $scope.transactionIsValid = $scope.validate()
    if $scope.transaction.amount? && $scope.transaction.amount > 0
      $scope.visualValidate("amount")
    
  $scope.validate = () ->    
    return false unless $scope.originsLoaded
    transaction = $scope.transaction
    
    return false if transaction.destination == null || (transaction.destination.type == "External" && transaction.destination.address == "")
        
    if transaction.destination.type == "External"
      return false unless Wallet.isValidAddress(transaction.destination.address)
        
    return false if transaction.destination == transaction.from
    
    $scope.errors.to = null
    
    return false unless $scope.validateAmount()  
    
    return true
    
  $scope.validateAmount = () ->
    amount = $scope.transaction.amount

    return false unless amount? && amount > 0      
    
    return false unless $scope.transaction.from? && $scope.transaction.from.balance?
    
    return false if $scope.transaction.satoshi + $scope.transaction.fee > $scope.transaction.from.balance

    return false if !$scope.validateAmountDecimals()
    $scope.errors.amount = null
    return true
  
  $scope.validateAmountDecimals = () ->
    return $scope.decimalPlaces($scope.transaction.amount) <= $scope.allowedDecimals()

  $scope.allowedDecimals = () ->
    currency = $scope.transaction.currencySelected
    return 8 if $scope.transaction.currency == 'BTC'
    return 2

  $scope.decimalPlaces = (number) ->
    return (number.split('.')[1] || []).length

  $scope.step = 1

  $scope.goToConfirmation = () ->
    $scope.confirmationStep = true
    $scope.step++
    
  $scope.backToForm = () ->
    $scope.confirmationStep = false    
    $scope.step--

