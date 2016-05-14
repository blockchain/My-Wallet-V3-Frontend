describe "WalletNavigationCtrl", ->
  scope = undefined

  Wallet = undefined

  modal =
    open: ->

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller) ->
      $rootScope.karma = true

      Wallet = $injector.get("Wallet")
      MyWallet = $injector.get("MyWallet")

      Wallet.status.isLoggedIn = true

      scope = $rootScope.$new()

      $controller "WalletNavigationCtrl",
        $scope: scope,
        $stateParams: {}
        $uibModal: modal

      return

    return

  it "should open modal to create a new account",  inject(() ->
    spyOn(modal, "open")
    scope.newAccount()
    expect(modal.open).toHaveBeenCalled()
  )

  describe "numberOfActiveLegacyAddresses()", ->
    it "should know the number", inject((Wallet) ->
      expect(scope.numberOfActiveLegacyAddresses()).toBe(1)
    )

    it "should be null when not logged in", inject((Wallet), ->
      Wallet.status.isLoggedIn = false
      expect(scope.numberOfActiveLegacyAddresses()).toBe(null)
    )

  it "should know the number of active acounts", inject(() ->
    expect(scope.numberOfActiveAccounts()).toBe(2)
  )

  it "should know the main account index when there is one account", inject(() ->
    scope.numberOfActiveAccounts = (-> 1)
    expect(scope.getMainAccountId()).toBe(0)
  )

  it "should know the main account index when there are multiple accounts", inject(() ->
    scope.status.isLoggedIn = true
    expect(scope.getMainAccountId()).toBe('')
  )

  it "should show imported addresses based on state", inject(() ->
    scope.selectedAccountIndex = 'imported'
    expect(scope.showImported()).toBe(false)
  )

  it "should show account based on state", inject(() ->
    expect(scope.showOrHide()).toBe(false)
  )
