describe "NavigationCtrl", ->
  scope = undefined
  mockModalInstance = undefined

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller) ->
      Wallet = $injector.get("Wallet")
      MyWallet = $injector.get("MyWallet")

      Wallet.status = {
        isLoggedIn: true
      }

      mockModalInstance =
        result: then: (confirmCallback, cancelCallback) ->
          #Store the callbacks for later when the user clicks on the OK or Cancel button of the dialog
          @confirmCallBack = confirmCallback
          @cancelCallback = cancelCallback
          return
        close: (item) ->
          #The user clicked OK on the modal dialog, call the stored confirm callback with the selected item
          @result.confirmCallBack item
          return
        dismiss: (type) ->
          #The user clicked cancel on the modal dialog, call the stored cancel callback
          @result.cancelCallback type
          return

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
    spyOn($uibModal, 'open').and.returnValue(mockModalInstance)

    $uibModal.dismiss('cancel');

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
