walletApp.controller "SendCtrl", ($scope, $log, Wallet, $modalInstance, $timeout, $state, $filter, $stateParams, $translate, paymentRequest, filterFilter, $modal) ->
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
  $scope.amountIsValid = true

  $scope.alerts = []

  $scope.fiatCurrency = Wallet.settings.currency
  $scope.btcCurrency = Wallet.settings.btcCurrency

  $scope.isBitCurrency = Wallet.isBitCurrency

  $scope.txProposal = null

  $scope.transactionTemplate = {
    from: null,
    destinations: [null],
    amounts: [0],
    fee: Wallet.settings.feePerKB
    customFee: null
    note: ""
    publicNote: false
  }

  $scope.transaction = angular.copy($scope.transactionTemplate)

  $scope.determineLabel = (origin) ->
    origin.label || origin.address

  $scope.getFilter = (search, accounts=true) ->
    {
      label: search
      type: if accounts then '!External' else 'Imported'
    }

  $scope.getBtcCap = () ->
    Wallet.convertFromSatoshi(2100000000000000, $scope.btcCurrency)

  $scope.getFiatCap = () ->
    Wallet.convertFromSatoshi(2100000000000000, $scope.fiatCurrency)

  $scope.hasZeroBalance = (origin) ->
    return origin.balance == 0.0

  $scope.onError = (error) ->
    # This never gets called...
    $translate("CAMERA_PERMISSION_DENIED").then (translation) ->
      Wallet.displayWarning(translation, false, $scope.alerts)

  $scope.applyPaymentRequest = (paymentRequest, i) ->
    $scope.processingPaymentRequest = true

    destination =
      address: paymentRequest.address || ""
      label: paymentRequest.address || ""
      type: "External"

    $scope.refreshDestinations(paymentRequest.address, i)

    $scope.transaction.amounts[i] = paymentRequest.amount || 0
    $scope.transaction.note = paymentRequest.message || ''

    $scope.validateAmounts()
    $scope.updateToLabel()

    # Hack, see: https://blockchain.atlassian.net/browse/WEBHD-269
    $scope.$$postDigest(()->
      $timeout(()->
        $scope.processingPaymentRequest = false
      , 3000)
    )


  $scope.processURLfromQR = (url) ->
    paymentRequest = Wallet.parsePaymentRequest(url)

    if paymentRequest.isValid
      $scope.applyPaymentRequest(paymentRequest, $scope.qrIndex)
      $scope.cameraOff()
    else
      $translate("QR_CODE_NOT_BITCOIN").then (translation) ->
        Wallet.displayWarning(translation, false, $scope.alerts)

      $log.error "Not a bitcoin QR code:" + url

  $scope.cameraOn = (index=0) ->
    $scope.$broadcast('ResetSearch' + index)
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

  $scope.resetSendForm = () ->
    $scope.transaction = angular.copy($scope.transactionTemplate)
    $scope.transaction.from = Wallet.accounts()[Wallet.my.wallet.hdwallet.defaultAccountIndex]
    $scope.transaction.customFee = Wallet.settings.feePerKB

    for i in [0..($scope.destinations.length - 1)]
      $scope.$broadcast('ResetSearch' + i)

    $scope.refreshTxProposal()

  $scope.addDestination = () ->
    originalDestinations = angular.copy($scope.destinations[0])
    $scope.destinations.push(originalDestinations)
    $scope.transaction.amounts.push(0)
    $scope.transaction.destinations.push(null)

  $scope.removeDestination = (index) ->
    $scope.destinations.splice(index, 1)
    $scope.transaction.amounts.splice(index, 1)
    $scope.transaction.destinations.splice(index, 1)

  $scope.numberOfActiveAccountsAndLegacyAddresses = () ->
    return filterFilter(Wallet.accounts(), {archived: false}).length + filterFilter(Wallet.legacyAddresses(), {archived: false}).length

  $scope.send = () ->
    return if $scope.sending

    $scope.sending = true
    Wallet.clearAlerts()

    # Set public note, if any
    if $scope.transaction.publicNote
      publicNote = $scope.transaction.note || null

    transactionFailed = (message) ->
      $scope.sending = false
      $translate(message).then((t) -> Wallet.displayError(t, false, $scope.alerts)) if message

    transactionSucceeded = (tx_hash) ->
      $scope.sending = false
      $modalInstance.close ""
      Wallet.beep()

      # Set the private note
      note = $scope.transaction.note.trim()
      if !$scope.transaction.publicNote && note != ""
        Wallet.setNote({hash: tx_hash}, note)

      # Switch to the from account transactions view, unless "all accounts" are visible.
      index = $scope.transaction.from.index
      index = 'imported' unless index?

      unless $state.current.name == "wallet.common.transactions" || $stateParams.accountIndex == "accounts"
        $state.go("wallet.common.transactions", { accountIndex: index })

      # Update the activity feed
      Wallet.saveActivity(0)

      # Show success notification
      $translate(['SUCCESS', 'BITCOIN_SENT']).then (translations) ->
        $scope.$emit 'showNotification',
          type: 'sent-bitcoin'
          icon: 'bc-icon-send'
          heading: translations.SUCCESS
          msg: translations.BITCOIN_SENT

    if !$scope.txProposal
      return transactionFailed('Could not complete transaction')

    publish = (passphrase) ->
      $scope.txProposal.publish(passphrase, publicNote)

    Wallet.askForSecondPasswordIfNeeded()
      .then(publish).then(transactionSucceeded)
      .catch(transactionFailed)

  $scope.closeAlert = (alert) ->
    Wallet.closeAlert(alert)

  $scope.allowedDecimals = (currency) ->
    if Wallet.isBitCurrency(currency)
      return 8 if currency.code == 'BTC'
      return 6 if currency.code == 'mBTC'
      return 4 if currency.code == 'bits'
    return 2

  $scope.decimalPlaces = (number) ->
    return (number.toString().split('.')[1] || []).length

  $scope.updateToLabel = () ->
    return unless $scope.transaction.destinations[0]?
    if $scope.advanced && $scope.transaction.destinations.length > 1
      $scope.toLabel = $scope.transaction.destinations.length + ' Recipients'
    else
      $scope.toLabel = $scope.transaction.destinations[0].label
      if $scope.transaction.destinations[0].index?
        $scope.toLabel += " Account"

  $scope.refreshDestinations = (query, i) ->
    return if query == "" && $scope.processingPaymentRequest
    return if $scope.destinations[i].length == 0
    $scope.updateToLabel()
    $scope.addExternalLabelIfNeeded(query, i)

  $scope.addExternalLabelIfNeeded = (query, i) ->
    last = $scope.destinations[i].slice(-1)[0]
    unless !query?
       last.address = query
       last.label = query

    if !$scope.transaction.destinations[i]? || $scope.transaction.destinations[i].type != "External"
      # Select the external account if it's the only match; otherwise when the user moves away from the field
      # the address will be forgotten. This is only an issue if the user selects an account first and then starts typing.
      for destination in $scope.destinations[i]
        if destination.type != "External" && (destination.label.indexOf(query) != -1 || (destination.address && destination.address.indexOf(query) != -1))
          if destination.address && destination.address.indexOf(query) != -1
            # We assume that someone copy-pasted an already imported or HD address, rather than typed it,
            # so resetting the search & selecting the address:
            console.log "Reset!"
            # $scope.$broadcast('ResetSearch' + i)
            $scope.transaction.destinations[i] = destination
          return
      $scope.transaction.destinations[i] = last

  $scope.getTransactionTotal = (includeFee) ->
    if includeFee then fee = $scope.transaction.fee else fee = 0
    $scope.transaction.amounts.reduce (previous, current) ->
      (parseInt previous + parseInt current) || 0
    , parseInt(fee)

  $scope.validateAmounts = (recommendCustom=true) ->
    return unless $scope.transaction.from?
    available = $scope.transaction.from.balance
    transactionTotal = $scope.getTransactionTotal(true)
    $scope.amountIsValid = available - transactionTotal >= 0
    $scope.refreshTxProposal(recommendCustom)

  $scope.allAmountsAboveZero = () ->
    $scope.transaction.amounts.every (amt) -> amt > 0

  $scope.checkForSameDestination = () ->
    transaction = $scope.transaction
    transaction.destinations.forEach (dest, index) ->
      match = false
      match = dest.label == transaction.from.label if dest?
      return unless $scope.sendForm?
      $scope.sendForm['destinations' + index].$setValidity('isNotEqual', !match)

  $scope.formatOrigin = (origin) ->
    formatted = {
      label: origin.label || origin.address
      index: origin.index
      address: origin.address
      balance: origin.balance
      archived: origin.archived
    }
    formatted.type = if origin.index? then 'Accounts' else 'Imported Addresses'
    formatted.isWatchOnly = origin.isWatchOnly if !origin.index?
    return formatted

  $scope.refreshTxProposal = (recommendCustom=true) ->
    tx = $scope.transaction
    fee = if recommendCustom then null else tx.customFee
    return unless tx.from && tx.destinations.every((i) -> i?) && tx.amounts.every((i) -> i?)
    $scope.txProposal = Wallet.transaction(tx.from, tx.destinations, tx.amounts, fee)
    $scope.txProposal.tx.then (_tx) ->
      $scope.transaction.fee = _tx.fee
      $scope.transaction.customFee = _tx.fee if recommendCustom
      $scope.$root.$safeApply($scope)

  #################################
  #           Private             #
  #################################

  $scope.$watch "transaction.destinations", (destinations) ->
    destinations.forEach (dest, index) ->
      return unless dest?
      if dest.type == 'Accounts' || dest.index?
        $scope.sendForm['destinations' + index].$setValidity('isValidAddress', true)
      else
        valid = Wallet.isValidAddress(dest.address)
        $scope.sendForm['destinations' + index].$setValidity('isValidAddress', valid)
      $scope.updateToLabel()
    $scope.refreshTxProposal()
  , true

  $scope.$watch "status.didLoadBalances", ->
    if $scope.status.didLoadBalances
      if $scope.origins.length == 0

        idx = Wallet.my.wallet.hdwallet.defaultAccountIndex
        unless isNaN($stateParams.accountIndex)
          idx = parseInt($stateParams.accountIndex)

        for account in $scope.accounts()
          account = $scope.formatOrigin(account)
          unless account.index? && account.archived
            if account.index == idx
              $scope.transaction.from = account
            $scope.origins.push account
            $scope.destinationsBase.push angular.copy(account) # https://github.com/angular-ui/ui-select/issues/656

        for address in $scope.legacyAddresses()
          address = $scope.formatOrigin(address)
          if !address.archived
            $scope.destinationsBase.push address
            unless address.isWatchOnly
              $scope.origins.push angular.copy(address)

        $scope.destinationsBase.push({address: "", label: "", type: "External"})
        $scope.destinations.push $scope.destinationsBase
        $scope.originsLoaded = true

        if paymentRequest.address? && paymentRequest.address != ''
          $scope.applyPaymentRequest(paymentRequest, 0)
        else if paymentRequest.toAccount?
          $scope.transaction.destinations[0] = $scope.formatOrigin(paymentRequest.toAccount)
          $scope.transaction.from = paymentRequest.fromAddress
        else if paymentRequest.fromAccount?
          $scope.transaction.from = paymentRequest.fromAccount

  # Step switching
  $scope.confirmationStep = false

  $scope.goToConfirmation = () ->
    $scope.confirmationStep = true
    $scope.refreshTxProposal(!$scope.advanced)

  $scope.backToForm = () ->
    $scope.confirmationStep = false

  # Advanced Send temporarily show HTML
  $scope.advanced = false

  $scope.advancedSend = () ->
    $scope.advanced = true
    $scope.transaction.customFee = $scope.transaction.fee
    $scope.refreshTxProposal()

  $scope.regularSend = () ->
    $scope.transaction.customFee = null
    $scope.transaction.destinations.splice(1)
    $scope.transaction.amounts.splice(1)
    $scope.advanced = false
    $scope.refreshTxProposal()
