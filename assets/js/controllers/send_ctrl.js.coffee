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

  $scope.alerts = Wallet.alerts

  $scope.isOpen = {currencies: false}

  $scope.fiatCurrency = Wallet.settings.currency
  $scope.btcCurrency = Wallet.settings.btcCurrency

  $scope.isBitCurrency = Wallet.isBitCurrency

  $scope.transactionTemplate = {
    from: null,
    destinations: [null],
    amounts: [null],
    fee: 10000
    note: ""
    publicNote: false
  }

  $scope.transaction = angular.copy($scope.transactionTemplate)

  $scope.determineLabel = (origin) ->
    origin.label || origin.address

  $scope.getFilter = (search, accounts=true) ->
    filter =
      label: search
      type: "!External"
    if !accounts
      filter.type = 'Imported'
    if $scope.numberOfActiveAccountsAndLegacyAddresses() == 1
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
    destination = {address: "", label: "", type: "External"}
    destination.address = paymentRequest.address
    destination.label = paymentRequest.address

    $scope.transaction.destinations[i] = destination

    if paymentRequest.amount && paymentRequest.currency == 'BTC'
      $scope.transaction.amounts[i] = Wallet.convertToSatoshi(paymentRequest.amount, Wallet.btcCurrencies[0])

    $scope.updateToLabel()

  $scope.processURLfromQR = (url) ->
    paymentRequest = Wallet.parsePaymentRequest(url)

    if paymentRequest.isValid
      $scope.applyPaymentRequest(paymentRequest, $scope.qrIndex)
      $scope.cameraOff()
    else
      $translate("QR_CODE_NOT_BITCOIN").then (translation) ->
        Wallet.displayWarning(translation)

      $log.error "Not a bitcoin QR code:" + url

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

  $scope.resetSendForm = () ->
    $scope.transaction = angular.copy($scope.transactionTemplate)
    $scope.transaction.from = Wallet.accounts[Wallet.getDefaultAccountIndex()]

  $scope.addDestination = () ->
    originalDestinations = angular.copy($scope.destinations[0])
    $scope.destinations.push(originalDestinations)
    $scope.transaction.amounts.push(null)
    $scope.transaction.destinations.push(null)

  $scope.removeDestination = (index) ->
    $scope.destinations.splice(index, 1)
    $scope.transaction.amounts.splice(index, 1)
    $scope.transaction.destinations.splice(index, 1)

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
          $translate(message).then (translation) ->
            Wallet.displayError(translation)
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
        # Switch to the from account transactions view, unless "all accounts" are visible.
        if $scope.transaction.from.index?
          if $state.current.name != "wallet.common.transactions" || ($state.params.accountIndex? && $state.params.accountIndex != "accounts")
            $state.go("wallet.common.transactions", {accountIndex: $scope.transaction.from.index })
        else
          $state.go("wallet.common.transactions", {accountIndex: "imported" })

        $translate("SUCCESS").then (titleTranslation) ->
          $translate("BITCOIN_SENT").then (messageTranslation) ->

            modalInstance = $modal.open(
              templateUrl: "partials/modal-notification.jade"
              controller: "ModalNotificationCtrl"
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

      transaction.send($scope.transaction.from, $scope.transaction.destinations, $scope.transaction.amounts, parseInt($scope.transaction.fee), publicNote)

      return

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
    if $scope.advanced
      $scope.toLabel = $scope.transaction.destinations.length + ' Recipients'
    else
      $scope.toLabel = $scope.transaction.destinations[0].label
      if $scope.transaction.destinations[0].index?
        $scope.toLabel += " Account"

  $scope.refreshDestinations = (query, i) ->
    return if $scope.destinations[i].length == 0
    last = $scope.destinations[i].slice(-1)[0]
    unless !query?
       last.address = query
       last.label = query

    $scope.updateToLabel()

    if $scope.transaction.destinations[i] == null || $scope.transaction.destinations[i].type != "External"
      # Select the external account if it's the only match; otherwise when the user moves away from the field
      # the address will be forgotten. This is only an issue if the user selects an account first and then starts typing.
      for destination in $scope.destinations[i]
        return if destination.type != "External" && destination.label.indexOf(query) != -1
      $scope.transaction.destinations[i] = last

  $scope.getTransactionTotal = (includeFee) ->
    if includeFee then fee = $scope.transaction.fee else fee = 0
    $scope.transaction.amounts.reduce (previous, current) ->
      (parseInt previous + parseInt current) || 0
    , parseInt(fee)

  $scope.validateAmounts = () ->
    return unless $scope.transaction.from?
    available = $scope.transaction.from.balance
    transactionTotal = $scope.getTransactionTotal(true)
    $scope.amountIsValid = available - transactionTotal >= 0

  #################################
  #           Private             #
  #################################

  $scope.$watch "transaction.destinations", (destinations) ->
    destinations.forEach (dest, index) ->
      return unless dest?
      if dest.type == 'Accounts'
        $scope.sendForm['destinations' + index].$setValidity('isValidAddress', true)
      else
        valid = Wallet.isValidAddress(dest.address)
        $scope.sendForm['destinations' + index].$setValidity('isValidAddress', valid)
      $scope.updateToLabel()
  , true

  $scope.$watch "status.didLoadBalances + status.legacyAddressBalancesLoaded", ->
    if $scope.status.didLoadBalances && $scope.status.legacyAddressBalancesLoaded
      if $scope.origins.length == 0

        defaultAccountIndex = Wallet.getDefaultAccountIndex()

        for account in $scope.accounts
          item = angular.copy(account)
          item.type = "Accounts"
          item.multiAccount = if item.index == 0 then false else true
          unless item.index? && !item.active
            if item.index == defaultAccountIndex
              $scope.transaction.from = item
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
        $scope.destinations.push $scope.destinationsBase
        $scope.originsLoaded = true

        if paymentRequest.address? && paymentRequest.address != ''
          $scope.applyPaymentRequest(paymentRequest, 0)
        else if paymentRequest.toAccount?
          $scope.transaction.destinations[0] = paymentRequest.toAccount
          $scope.transaction.from = paymentRequest.fromAddress

  # Step switching
  $scope.confirmationStep = false

  $scope.goToConfirmation = () ->
    $scope.confirmationStep = true

  $scope.backToForm = () ->
    $scope.confirmationStep = false

  # Advanced Send temporarily show HTML
  $scope.advanced = false

  $scope.advancedSend = () ->
    $scope.advanced = true

  $scope.regularSend = () ->
    $scope.transaction.fee = $scope.transactionTemplate.fee
    $scope.transaction.destinations.splice(1)
    $scope.transaction.amounts.splice(1)
    $scope.advanced = false
