walletApp.controller "RequestCtrl", ($scope, Wallet, $modalInstance, $log, destination, $translate, $stateParams, filterFilter) ->
  $scope.status = Wallet.status
  $scope.settings = Wallet.settings

  $scope.accounts = Wallet.accounts
  $scope.legacyAddresses = Wallet.legacyAddresses

  $scope.isBitCurrency = Wallet.isBitCurrency

  $scope.destinations = []
  $scope.receiveAddress = null
  $scope.fields = {to: null, amount: 0, label: ""}

  # Adds active accounts to the destinations array
  for account in $scope.accounts()
    if account.index? && !account.archived
      acct = angular.copy(account)
      acct.type = "Accounts"
      $scope.destinations.push acct

      if destination? && destination.index? && destination.index == acct.index
        $scope.fields.to = acct

  # Adds active legacy addresses to the destinations array
  for address in $scope.legacyAddresses()
    if !address.archived
      addr = angular.copy(address)
      addr.type = "Imported Addresses"
      addr.label = addr.label || addr.address
      $scope.destinations.push addr

  $scope.getFilter = (search, accounts=true) ->
    {
      label: search
      type: if accounts then '!External' else 'Imported'
    }

  $scope.determineLabel = (origin) ->
    return unless origin?
    origin.label || origin.address

  $scope.closeAlert = (alert) ->
    Wallet.closeAlert(alert)

  $scope.close = () ->
    Wallet.clearAlerts()
    $modalInstance.dismiss ""

  $scope.numberOfActiveAccountsAndLegacyAddresses = () ->
    activeAccounts = filterFilter(Wallet.accounts(), {archived: false})
    activeAddresses = filterFilter(Wallet.legacyAddresses(), {archived: false})
    return activeAccounts.length + activeAddresses.length

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
    if $scope.fields.to? && $scope.fields.to.address?
      $scope.setPaymentRequestURL($scope.fields.to.address, $scope.fields.amount)
    else if $scope.fields.label == "" && $scope.status.didInitializeHD
      idx = $scope.fields.to.index
      $scope.receiveAddress = Wallet.getReceivingAddressForAccount(idx)
      $scope.setPaymentRequestURL($scope.receiveAddress, $scope.fields.amount)

  $scope.$watch "fields.amount + fields.currency.code + fields.label", (oldValue, newValue) ->
    if $scope.fields.to? && $scope.fields.amount
      if $scope.fields.to.address?
        $scope.setPaymentRequestURL($scope.fields.to.address, $scope.fields.amount)
      else if $scope.receiveAddress?
        $scope.setPaymentRequestURL($scope.receiveAddress, $scope.fields.amount)

  $scope.setPaymentRequestURL = (address, amount) ->
    $scope.paymentRequestAddress = address
    $scope.paymentRequestURL = "bitcoin:" + address
    if amount > 0
      $scope.paymentRequestURL += "?amount=" + parseFloat(amount / 100000000)
