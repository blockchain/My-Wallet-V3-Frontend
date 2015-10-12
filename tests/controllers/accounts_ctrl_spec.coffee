describe "WalletNavigationCtrl", ->
  scope = undefined

  modal =
    open: ->

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller) ->
      Wallet = $injector.get("Wallet")
      MyWallet = $injector.get("MyWallet")

      MyWallet.wallet = {
        balanceSpendableActiveLegacy: 100000000
        keys: [{ archived: false }, { archived: true }]
        hdwallet: {
          accounts: [{ archived: false }, { archived: false }, { archived: true }]
        }
      }

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

  it "should show the total balance of legacy address",  inject((Wallet) ->
    spyOn(Wallet, "getTotalBalanceForActiveLegacyAddresses").and.callThrough()
    expect(scope.legacyTotal()).toBe(100000000)
    expect(Wallet.getTotalBalanceForActiveLegacyAddresses).toHaveBeenCalled()
  )

  it "should know the number of active legacy addresses", inject((Wallet) ->
    expect(scope.numberOfActiveLegacyAddresses()).toBe(1)
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
    expect(scope.getMainAccountId()).toBe('accounts')
  )

  it "should show imported addresses based on state", inject(() ->
    scope.selectedAccountIndex = 'imported'
    expect(scope.showImported()).toBe(false)
  )

  it "should show account based on state", inject(() ->
    expect(scope.showOrHide()).toBe(false)
  )

  it "should open modal to see Terms of Service",  inject(() ->
    spyOn(modal, "open")
    scope.termsOfService()
    expect(modal.open).toHaveBeenCalled()
  )

  it "should open modal to see Privacy Policy",  inject(() ->
    spyOn(modal, "open")
    scope.privacyPolicy()
    expect(modal.open).toHaveBeenCalled()
  )
