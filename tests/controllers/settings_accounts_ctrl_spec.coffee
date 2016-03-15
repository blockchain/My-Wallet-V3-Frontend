describe "SettingsAccountsController", ->
  scope = undefined

  modal =
    open: ->

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller) ->
      Wallet = $injector.get("Wallet")

      Wallet.accounts = () -> [{},{}]
      Wallet.my.wallet = {
        addressBook: {}
      }

      Wallet.status.isLoggedIn = true

      scope = $rootScope.$new()

      $controller "SettingsAccountsController",
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

  it "should list accounts",  inject(() ->
    expect(scope.accounts().length).toBeGreaterThan(1)
  )

  it "should open modal to edit an account",  inject(() ->
    account = scope.accounts()[0]
    spyOn(modal, "open")
    scope.editAccount(account)
    expect(modal.open).toHaveBeenCalled()
  )

  it "should open modal to reveal the xpub",  inject(() ->
    account = scope.accounts()[0]
    spyOn(modal, "open")
    scope.revealXpub(account)
    expect(modal.open).toHaveBeenCalled()
  )

  it "should open modal to transfer funds",  inject(() ->
    spyOn(modal, "open")
    scope.transfer()
    expect(modal.open).toHaveBeenCalled()
  )
