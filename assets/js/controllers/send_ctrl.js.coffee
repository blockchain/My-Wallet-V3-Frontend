@SendCtrl = ($scope, $log, Wallet, $modalInstance, $timeout, $state, $filter, $stateParams, $translate, paymentRequest, filterFilter, $modal) ->
  $scope.legacyAddresses = Wallet.legacyAddresses
  $scope.accounts = Wallet.accounts
  $scope.addressBook = Wallet.addressBook
  $scope.status = Wallet.status
  $scope.settings = Wallet.settings

  $scope.origins = []
  $scope.destinations = []
  $scope.destinationsBase = []

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
            $scope.destinationsBase.push angular.copy(item) # https://github.com/angular-ui/ui-select/issues/656

        for address in $scope.legacyAddresses
          if address.active
            item = angular.copy(address)
            item.type = "Imported Addresses"
            item.multiAccount = false
            $scope.destinationsBase.push item
            unless address.isWatchOnlyLegacyAddress
              $scope.origins.push angular.copy(item)

        $scope.destinationsBase.push({address: "", label: "", type: "External"})
        $scope.transaction.destination =  $scope.destinationsBase.slice(-1)[0]
        $scope.destinations.push $scope.destinationsBase
        $scope.originsLoaded = true

        $scope.errors.to = null
        if paymentRequest.address?
          $scope.applyPaymentRequest(paymentRequest, 0)
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

  $scope.isBitCurrency = Wallet.isBitCurrency

  $scope.convertToFiat = (amount) ->
    Wallet.convertCurrency(amount, Wallet.settings.btcCurrency, Wallet.settings.currency)

  $scope.convertToBTC = (amount) ->
    Wallet.convertCurrency(amount, Wallet.settings.currency, Wallet.settings.btcCurrency)

  $scope.convertToSatoshi = (amount) ->
    Wallet.convertToSatoshi(amount, $scope.transaction.currency)

  $scope.convertFromSatoshi = (amount) ->
    Wallet.convertFromSatoshi(amount, $scope.transaction.currency)

  $scope.determineLabel = (origin) ->
    label = origin.label || origin.address
    return label

  $scope.maxAndLabelForSelect = (select) ->
    return "" unless select?
    return "" unless select.selected?

    $scope.maxAndLabel(select.selected)

  $scope.maxAndLabel = (origin) ->

    label = $scope.determineLabel(origin)
    code = $scope.transaction.currency.code

    if origin.balance == undefined
      return label

    fees = Wallet.recommendedTransactionFee(origin, origin.balance)

    max_btc = numeral(origin.balance - fees).divide($scope.btcCurrency.conversion)

    max_btc = numeral(0) if max_btc < 0

    if $scope.isBitCurrency($scope.transaction.currency)
      return label + " (" + max_btc.format("0.[00000000]") + " " + code + ")"
    else
      return label + " (" + $scope.convertToFiat(max_btc) + " " + code + ")"



  $scope.transactionTemplate = {
    from: null,
    to: paymentRequest.address,
    destination: null,
    amount: paymentRequest.amount,
    satoshi: 0,
    multipleDestinations: [null],
    multipleAmounts: [0],
    currency: Wallet.settings.btcCurrency,
    fee: 10000
    note: ""
    publicNote: false
  }

  $scope.transaction = angular.copy($scope.transactionTemplate)
  $scope.feeAmount =  parseFloat(numeral($scope.transaction.fee).divide($scope.btcCurrency.conversion).format('0.[00000]'))

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

# TODO: what is supposed to do that with multiple accounts
  $scope.applyPaymentRequest = (paymentRequest, i) ->
    destination = $scope.destinations[i].slice(-1)[0]
    destination.address = paymentRequest.address
    destination.label = paymentRequest.address
    
    if $scope.advanced
      $scope.transaction.multipleDestinations[i] = destination
    else
      $scope.transaction.destination = destination
        
    if paymentRequest.amount
      $scope.transaction.amount = paymentRequest.amount
      $scope.transaction.currency = Wallet.settings.btcCurrency

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
      $scope.applyPaymentRequest(paymentRequest, $scope.qrIndex)
    else
      $translate("QR_CODE_NOT_BITCOIN").then (translation) ->
        Wallet.displayWarning(translation)

      $log.error "Not a bitcoin QR code:" + url

      $timeout((->
        $scope.lookForQR()
      ), 2000)

  $scope.cameraOn = (index=0) ->
    $scope.cameraRequested = true
    $scope.qrIndex = index

  $scope.cameraOff = () ->
    # $scope.qrStream.stop()
    $scope.cameraIsOn = false
    $scope.cameraRequested = false
    $scope.qrIndex = null

  $scope.close = () ->
    Wallet.clearAlerts()
    $modalInstance.dismiss ""

  $scope.nextAlternativeCurrency = () ->
    if $scope.isBitCurrency($scope.transaction.currency)
       return $scope.fiatCurrency
    else
      return $scope.btcCurrency

  $scope.toggleCurrency = () ->
    $scope.transaction.currency = $scope.nextAlternativeCurrency()
    $scope.feeAmount = $scope.convertFromSatoshi(parseInt($scope.transaction.fee))

  $scope.resetSendForm = () ->
    $scope.transaction = angular.copy($scope.transactionTemplate)
    $scope.feeAmount = parseInt($scope.transaction.fee) / $scope.btcCurrency.conversion

  $scope.addDestination = () ->
    originalDestinations = angular.copy($scope.destinations[0])
    $scope.destinations.push(originalDestinations)
    $scope.transaction.multipleAmounts.push(0)
    $scope.transaction.multipleDestinations.push(null)

  $scope.removeDestination = (index) ->
    $scope.destinations.splice(index, 1)
    $scope.transaction.multipleAmounts.splice(index, 1)
    $scope.transaction.multipleDestinations.splice(index, 1)
    $scope.visualValidate('amounts')

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

        $translate("SUCCESS").then (titleTranslation) ->
          $translate("BITCOIN_SENT").then (messageTranslation) ->

            modalInstance = $modal.open(
              templateUrl: "partials/modal-notification.jade"
              controller: ModalNotificationCtrl
              windowClass: "notification-modal"
              resolve:
                notification: ->
                  {
                    type: 'sent-bitcoin'
                    icon: 'bc-icon-send'
                    heading: titleTranslation
                    msg: messageTranslation
                  }
            ).opened.then () ->
              Wallet.store.resetLogoutTimeout()

      Wallet.clearAlerts()

      transaction = Wallet.transaction(transactionDidFinish, transactionDidFailWithError)

      if $scope.advanced
        transaction.sendAdvanced($scope.transaction.from, $scope.transaction.multipleDestinations, $scope.transaction.multipleAmounts, $scope.transaction.fee, $scope.transaction.currency, publicNote)
      else
        transaction.send($scope.transaction.from, $scope.transaction.destination, numeral($scope.transaction.amount), $scope.transaction.currency, publicNote)

      return

  $scope.closeAlert = (alert) ->
    Wallet.closeAlert(alert)

  $scope.allowedDecimals = () ->
    currency = $scope.transaction.currencySelected
    return 8 if $scope.isBitCurrency($scope.transaction.currency)
    return 2

  $scope.decimalPlaces = (number) ->
    return (number.split('.')[1] || []).length

  $scope.updateToLabel = () ->
    return unless $scope.transaction.destination?
    $scope.toLabel = $scope.transaction.destination.label
    if $scope.transaction.destination.index?
      $scope.toLabel += " Account"

  $scope.refreshDestinations = (query, i) ->
    return if $scope.destinations[i].length == 0
    last = $scope.destinations[i].slice(-1)[0]
    unless !query? || query == ""
       last.address = query
       last.label = query

    $scope.transactionIsValid = $scope.validate()
    $scope.updateToLabel()

    unless $scope.transaction.destination.type == "External"
      # Select the external account if it's the only match; otherwise when the user moves away from the field
      # the address will be forgotten. This is only an issue if the user selects an account first and then starts typing.
      for destination in $scope.destinations[i]
        return if destination.type != "External" && destination.label.indexOf(query) != -1
      $scope.transaction.destination = last

  $scope.updateFee = (feeAmount) ->
    if feeAmount
      $scope.feeAmount = $scope.convertFromSatoshi($scope.transaction.fee)
    else
      $scope.transaction.fee = $scope.convertToSatoshi($scope.feeAmount)

  $scope.addAmounts = () ->
    sum = 0
    for amount in $scope.transaction.multipleAmounts
      sum += $scope.convertToSatoshi(amount)
    return sum

  #################################
  #           Private             #
  #################################

  # Validation watchers

  $scope.$watch "transaction.fee", (fee) ->
    $scope.transactionIsValid = $scope.validate()
    $scope.visualValidate('fee')

  $scope.$watchCollection "transaction.multipleAmounts", (fee) ->
    $scope.transactionIsValid = $scope.validate()
    $scope.transaction.satoshi = $scope.addAmounts()

  $scope.$watchCollection "transaction.multipleDestinations", (fee) ->
    $scope.transactionIsValid = $scope.validate()
    $scope.visualValidate('destinations')

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

  $scope.$watchCollection "[transaction.destination, transaction.from, transaction.amount, transaction.currency, transaction.note]", () ->
    $scope.transaction.satoshi = $scope.convertToSatoshi($scope.transaction.amount)

    if !$scope.advanced
      $scope.transaction.fee = Wallet.recommendedTransactionFee($scope.transaction.from, $scope.transaction.satoshi)
    $scope.transactionIsValid = $scope.validate()

  $scope.$watch "transaction.from", () ->
    $scope.transactionIsValid = $scope.validate()
    if $scope.transaction.from?
      $scope.from = $scope.transaction.from.label + " Account"
      $scope.visualValidate("from")
      $scope.visualValidate("to")
      $scope.visualValidate("destinations")

  $scope.$watch "originsLoaded", ->
    $scope.transactionIsValid = $scope.validate()
    if $scope.transaction.amount? && $scope.transaction.amount > 0
      $scope.visualValidate("amount")

  $scope.$watch "transaction.destination", ((newValue) ->
    $scope.updateToLabel()
    $scope.visualValidate("to")
    $scope.transactionIsValid = $scope.validate()
  ), true

  # Form validation

  $scope.visualValidate = (field) ->
    validation = null

    if field == "to"
      $scope.errors.to = null
      $scope.success.to = null
      validation = $scope.validateDestination()

      if !validation.isValid && validation.error?
        $translate(validation.error).then (translation) ->
          $scope.errors.to = translation
      else if validation.isValid
        $scope.success.to = true
      return

    if field == "amount"
      validation = $scope.validateAmount()

    if field == "note"
      validation = $scope.validateNote()

    if field == "fee"
      validation = $scope.validateFee()

    if field == "amounts"
      validation = $scope.validateAmounts()

    if field == "destinations"
      validation = $scope.validateDestinations()

    return unless validation?

    if !validation.isValid
      $scope.errors[field] = validation.error
    else
      $scope.errors[field] = null

    return

  $scope.validateAmounts = () ->
    sum = 0
    for i in $scope.transaction.multipleAmounts
      amount = parseFloat(i)
      return {error: "Please enter a valid amount", isValid: false} if isNaN(amount)
      return {error: "Cannot enter a negative amount", isValid: false} if amount < 0
      return {error: "Please enter an amount", isValid: false} unless amount? && amount > 0
      sum += amount
    if $scope.transaction.from? && $scope.transaction.from.balance?
      return {error: "Insufficient funds", isValid: false} if numeral(sum).multiply($scope.btcCurrency.conversion) + parseInt($scope.transaction.fee) > $scope.transaction.from.balance
    return {isValid: true}

  $scope.validateDestinations = () ->
    for dest in $scope.transaction.multipleDestinations
      return {isValid: false} unless dest? && dest.type?
      if (dest.type == "External" && dest.address == "")
        return {error: 'Cannot leave destination field blank', isValid: false} if dest.address == ""
        return {error: 'Not a valid bitcoin address', isValid: false} unless Wallet.isValidAddress(dest.address)
      if dest.type == "Accounts"
        return {error: 'Cannot send to self', isValid: false} if dest.index == $scope.transaction.from.index
      else
        return {error: 'Cannot send to self', isValid: false} if dest.address == $scope.transaction.from.address
    return {isValid: true}

  $scope.validateAmount = () ->
    amount = $scope.transaction.amount
    return {error: 'Please enter amount', isValid: false} unless amount? && amount > 0
    return {error: 'Please fill out the "From" field', isValid: false} unless $scope.transaction.from? && $scope.transaction.from.balance?
    return {error: 'Insufficient funds', isValid: false} if $scope.transaction.satoshi + parseInt($scope.transaction.fee) > $scope.transaction.from.balance
    return {error: 'Maximum number of decimal places exceeded', isValid: false} if !$scope.validateAmountDecimals().isValid
    return {isValid: true}

  $scope.validateAmountDecimals = () ->
    return {isValid: false} unless $scope.decimalPlaces($scope.transaction.amount) <= $scope.allowedDecimals()
    return {isValid: true}

  $scope.validateDestination = () ->
    transaction = $scope.transaction
    return {isValid: false} if transaction.destination == null || (transaction.destination.type == 'External' && transaction.destination.address == '')
    if transaction.destination.type == 'External'
      return {error: 'BITCOIN_ADDRESS_INVALID', isValid: false} unless Wallet.isValidAddress(transaction.destination.address)
    if transaction.destination.type == 'Accounts'
      return {error: 'SAME_DESTINATION', isValid: false} if transaction.destination.index == transaction.from.index
    else
      return {error: 'SAME_DESTINATION', isValid: false} if transaction.destination == transaction.from
    return {isValid: true}

  $scope.validateFee = () ->
    return {error: 'Fee cannot be less than zero', isValid: false} if parseInt($scope.feeAmount) < 0
    return {error: 'Fee must be a number', isValid: false} if isNaN(parseInt($scope.feeAmount))
    return {error: 'Fee cannot be left blank', isValid: false} if $scope.feeAmount == ""
    return {isValid: true}

  $scope.validateNote = () ->
    return {isValid: false} if $scope.transaction.note.length > 512
    return {isValid: true}

  $scope.validateForAdvanced = () ->
    return false unless $scope.validateAmounts().isValid
    return false unless $scope.validateDestinations().isValid
    return true

  $scope.validateForSimple = () ->
    return false unless $scope.validateAmount().isValid
    return false unless $scope.validateAmountDecimals().isValid
    return false unless $scope.validateDestination().isValid
    return true

  $scope.validate = () ->
    return false unless $scope.originsLoaded
    return false unless $scope.validateFee()
    return false unless $scope.validateNote()
    if $scope.advanced
      return $scope.validateForAdvanced()
    else
      return $scope.validateForSimple()

  # Step switching

  $scope.step = 1

  $scope.goToConfirmation = () ->
    $scope.confirmationStep = true
    $scope.step++

  $scope.backToForm = () ->
    $scope.confirmationStep = false
    $scope.step--

  # Advanced Send temporarily show HTML

  $scope.advanced = false

  $scope.advancedSend = () ->
    $scope.transactionIsValid = $scope.validate()
    return $scope.advanced = true

  $scope.regularSend = () ->
    $scope.transactionIsValid = $scope.validate()
    return $scope.advanced = false
