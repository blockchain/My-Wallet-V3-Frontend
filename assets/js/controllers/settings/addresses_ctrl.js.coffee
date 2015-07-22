walletApp.controller "SettingsAddressesCtrl", ($scope, Wallet, $translate, $modal, $state, addressOrNameMatchFilter) ->
  $scope.legacyAddresses = Wallet.legacyAddresses
  $scope.display = {archived: false, account_dropdown_open: false}
  $scope.accounts = Wallet.accounts
    
  $scope.hdAddresses = Wallet.hdAddresses
  
  $scope.toggleDisplayImported = () ->
    $scope.display.imported = !$scope.display.imported
    $scope.display.archived = false

  $scope.toggleDisplayArchived = () ->
    $scope.display.archived = !$scope.display.archived
    $scope.display.imported = false

  $scope.settings = Wallet.settings

  $scope.addAddressForAccount = (account) ->

    success = (index) ->
      $state.go "wallet.common.settings.hd_address", {account: account.index, index: index}

    error = () ->

    Wallet.addAddressForAccount(account, success, error)

  $scope.clear = (request) ->
    Wallet.cancelPaymentRequest(request.account, request.address)

  $scope.archive = (address) ->
    Wallet.archive(address)

  $scope.unarchive = (address) ->
    Wallet.unarchive(address)

  $scope.delete = (address) ->
    $translate("LOSE_ACCESS").then (translation) ->
      if confirm translation
        Wallet.deleteLegacyAddress(address)
        $scope.legacyAddresses = Wallet.legacyAddresses

  $scope.importAddress = () ->
    Wallet.clearAlerts()
    modalInstance = $modal.open(
      templateUrl: "partials/settings/import-address.jade"
      controller: "AddressImportCtrl"
      windowClass: "bc-modal"
    )
    if modalInstance?
      modalInstance.opened.then () ->
        Wallet.store.resetLogoutTimeout()

  $scope.transfer = (address) ->
    modalInstance = $modal.open(
      templateUrl: "partials/send.jade"
      controller: "SendCtrl"
      windowClass: "bc-modal"
      resolve:
        paymentRequest: ->
          {fromAddress: address, amount: 0, toAccount: Wallet.accounts()[Wallet.getDefaultAccountIndex()]}
    )
    if modalInstance?
      modalInstance.opened.then () ->
        Wallet.store.resetLogoutTimeout()

  $scope.showPrivKey = (address) ->
    modalInstance = $modal.open(
      templateUrl: "partials/settings/show-private-key.jade"
      controller: "ShowPrivateKeyCtrl"
      windowClass: "bc-modal"
      resolve:
        addressObj: ->
          address
    )
    if modalInstance?
      modalInstance.opened.then () ->
        Wallet.store.resetLogoutTimeout()

  #################################
  #           Private             #
  #################################

  $scope.didLoad = () ->
    $scope.requests = Wallet.paymentRequests

  # First load:
  $scope.didLoad()
