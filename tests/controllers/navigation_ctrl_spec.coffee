describe "NavigationCtrl", ->
  scope = undefined

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller) ->
      Wallet = $injector.get("Wallet")
      MyWallet = $injector.get("MyWallet")
      Alerts = $injector.get("Alerts")

      Alerts.confirm = (msg) ->
        then: (f) ->
          if msg != 'CHANGES_BEING_SAVED'
            f(true)

      Wallet.status = {
        isLoggedIn: true
      }

      MyWallet.logout = () ->
        Wallet.status.isLoggedIn = false

      MyWallet.sync = () ->
        Wallet.store.setIsSynchronizedWithServer(false)

      Wallet.isSynchronizedWithServer = () ->
        Wallet.store.isSynchronizedWithServer()

      Wallet.store.setIsSynchronizedWithServer(true)

      scope = $rootScope.$new()

      $controller "NavigationCtrl",
        $scope: scope,
        $stateParams: {}

      return

    return

  it "should have access to login status",  inject(() ->
    expect(scope.status.isLoggedIn).toBe(true)
  )

  it "should logout",  inject((Wallet, $stateParams, $state, $uibModal) ->
    spyOn(Wallet, "logout").and.callThrough()
    spyOn($state, "go")

    scope.logout()

    expect(Wallet.logout).toHaveBeenCalled()
    expect(scope.status.isLoggedIn).toBe(false)
  )

  it "should not logout if save is in progress",  inject((Wallet, MyWallet, $stateParams) ->
    spyOn(Wallet, "logout").and.callThrough()

    MyWallet.sync()
    scope.logout()

    expect(Wallet.logout).not.toHaveBeenCalled()
    expect(scope.status.isLoggedIn).toBe(true)
  )
