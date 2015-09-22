angular.module('walletApp').controller "WalletNavigationCtrl", ($scope, Wallet, SecurityCenter, $state, $stateParams, $modal, filterFilter, $location) ->
  $scope.status    = Wallet.status
  $scope.total = Wallet.total
  $scope.settings = Wallet.settings
  $scope.security = SecurityCenter.security

  $scope.numberOfActiveLegacyAddresses = () ->
    return filterFilter(Wallet.legacyAddresses(), {archived: false}).length

  $scope.numberOfActiveAccounts = () ->
    return filterFilter(Wallet.accounts(), {archived: false}).length

  $scope.getMainAccountId = () ->
    return 0 unless $scope.status.isLoggedIn
    account = 'accounts'
    if $scope.numberOfActiveAccounts() <= 1
      account = Wallet.getDefaultAccountIndex()
    return account

  $scope.selectedAccountIndex = $stateParams.accountIndex

  $scope.showImported = () ->
    $scope.selectedAccountIndex == 'imported' && $state.current.name == 'wallet.common.transactions'


  $scope.showOrHide = (path) ->
    return $location.url().indexOf(path) != -1

  $scope.newAccount = () ->
    Wallet.clearAlerts()
    modalInstance = $modal.open(
      templateUrl: "partials/account-form.jade"
      controller: "AccountFormCtrl"
      resolve:
        account: -> undefined
      windowClass: "bc-modal small"
    )
    if modalInstance?
      modalInstance.opened.then () ->
        Wallet.store.resetLogoutTimeout()

  $scope.legacyTotal = () ->
    return Wallet.getTotalBalanceForActiveLegacyAddresses()

  $scope.termsOfService = () ->
    modalInstance = $modal.open(
      templateUrl: "partials/terms-of-service.jade"
      windowClass: "bc-modal terms-modal"
    )
  $scope.privacyPolicy = () ->
    modalInstance = $modal.open(
      templateUrl: "partials/privacy-policy.jade"
      windowClass: "bc-modal terms-modal"
    )
  #################################
  #           Private             #
  #################################

  $scope.didLoad = () ->
    $scope.accounts = Wallet.accounts

  # First load:
  $scope.didLoad()
