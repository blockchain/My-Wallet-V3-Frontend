walletApp.controller "SettingsWalletNavigationCtrl", ($scope, Wallet, $modal, filterFilter) ->
  $scope.accounts = Wallet.accounts

  $scope.display = {archived: false}

  $scope.numberOfActiveAccounts = () ->
    return filterFilter(Wallet.accounts(), {archived: false}).length

  $scope.newAccount = () ->
    Wallet.clearAlerts()
    modalInstance = $modal.open(
      templateUrl: "partials/account-form.jade"
      controller: "AccountFormCtrl"
      resolve:
        account: -> undefined
      windowClass: "bc-modal"
    )
    if modalInstance?
      modalInstance.opened.then () ->
        Wallet.store.resetLogoutTimeout()

  $scope.editAccount = (account) ->
    Wallet.clearAlerts()
    modalInstance = $modal.open(
      templateUrl: "partials/account-form.jade"
      controller: "AccountFormCtrl"
      resolve:
        account: -> account
      windowClass: "bc-modal"
    )
    if modalInstance?
      modalInstance.opened.then () ->
        Wallet.store.resetLogoutTimeout()

  $scope.showAddress = (account) ->

    modalInstance = $modal.open(
      templateUrl: "partials/request.jade"
      controller: "RequestCtrl"
      resolve:
        destination: -> account
      windowClass: "bc-modal"
    )
    if modalInstance?
      modalInstance.opened.then () ->
        Wallet.store.resetLogoutTimeout()


  $scope.makeDefault = (account) ->
    Wallet.setDefaultAccount(account)
    Wallet.saveActivity(3)

  $scope.transfer = () ->
    modalInstance = $modal.open(
      templateUrl: "partials/send.jade"
      controller: "SendCtrl"
      resolve:
        paymentRequest: ->
          {fromAccount: Wallet.accounts()[Wallet.getDefaultAccountIndex()], amount: 0}
      windowClass: "bc-modal"
    )
    if modalInstance?
      modalInstance.opened.then () ->
        Wallet.store.resetLogoutTimeout()

  $scope.archive = (account) -> Wallet.archive(account)
  $scope.unarchive = (account) -> Wallet.unarchive(account)
  $scope.isDefault = (account) -> Wallet.isDefaultAccount(account)
