walletApp.controller "RequestCtrl", ($scope, Wallet, $modalInstance, $log, destination, $translate, $stateParams, filterFilter) ->
  $scope.accounts = Wallet.accounts
  $scope.legacyAddresses = Wallet.legacyAddresses
  $scope.destinations = []
  $scope.receiveAddress = null
  $scope.status = Wallet.status
  $scope.settings = Wallet.settings
  $scope.isBitCurrency = Wallet.isBitCurrency

  $scope.currencies = angular.copy(Wallet.currencies)
  $scope.btcCurrencies = angular.copy(Wallet.btcCurrencies).reverse()

  for currency in $scope.currencies
    currency.type = "Fiat"

  for btcCurrency in $scope.btcCurrencies
    btcCurrency.type = "Crypto"
    $scope.currencies.unshift btcCurrency

  $scope.fields = {to: null, amount: "0", currency: Wallet.settings.currency, label: ""}

  for account in $scope.accounts()
    if account.index? && !account.archived
      acct = angular.copy(account)
      acct.type = "Accounts"
      $scope.destinations.push acct

      if destination? && destination.index? && destination.index == acct.index
        $scope.fields.to = acct

  for address in $scope.legacyAddresses()
    if !address.archived
      addr = angular.copy(address)
      addr.type = "Imported Addresses"
      addr.label = addr.label || addr.address
      $scope.destinations.push addr

  $scope.determineLabel = (origin) ->
    label = origin.label || origin.address
    return label

  $scope.closeAlert = (alert) ->
    Wallet.closeAlert(alert)

  $scope.close = () ->
    Wallet.clearAlerts()
    $modalInstance.dismiss ""

  $scope.numberOfActiveAccountsAndLegacyAddresses = () ->
    return filterFilter(Wallet.accounts(), {archived: false}).length + filterFilter(Wallet.legacyAddresses(), {archived: false}).length

  #################################
  #           Private             #
  #################################

  $scope.$watchCollection "destinations", () ->
    idx = Wallet.getDefaultAccountIndex()
    if !$scope.fields.to? && $scope.accounts().length > 0
      if $stateParams.accountIndex == "accounts" || !$stateParams.accountIndex? # The latter is for Jasmine
        # Nothing to do, just use the default index
      else if $stateParams.accountIndex == "imported" || !$stateParams.accountIndex?
        # Use default index
      else
        idx = parseInt($stateParams.accountIndex)
      $scope.fields.to = $scope.accounts()[idx]

  $scope.$watch "fields.to.index + fields.to.address + status.didInitializeHD", () ->
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
    else if $scope.isBitCurrency($scope.fields.currency)
      return parseInt(numeral($scope.fields.amount).multiply($scope.fields.currency.conversion).format("0"))
    else
      return Wallet.fiatToSatoshi($scope.fields.amount, $scope.fields.currency.code)

  $scope.$watch "fields.amount + fields.currency.code + fields.label", (oldValue, newValue) ->
    amount = $scope.parseAmount()
    $scope.paymentRequestAmount = amount

    if $scope.fields.to?
      if $scope.fields.to.address?
        $scope.setPaymentRequestURL($scope.fields.to.address, amount)
      else if $scope.requestForm.$valid
        $scope.setPaymentRequestURL($scope.receiveAddress, amount)

  $scope.setPaymentRequestURL = (address, amount) ->
    $scope.paymentRequestAddress = address
    $scope.paymentRequestURL = "bitcoin:" + address
    if amount > 0
      $scope.paymentRequestURL += "?amount=" + numeral(amount).divide(100000000)
