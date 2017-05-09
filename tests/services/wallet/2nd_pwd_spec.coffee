describe "walletServices 2nd pwd", () ->
  Wallet = undefined

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, $q) ->

      Wallet = $injector.get("Wallet")

      Wallet.my = {
        wallet:
          isUpgradedToHD: true
          hdwallet:
            isMnemonicVerified: true
            accounts: [{balance: 1, archived: false},{balance: 2, archived: false}]
          metadata: (n) ->
            fetch: () -> $q.resolve(lastViewed: 4)
            update: () -> $q.resolve(lastViewed: 4)
          encrypt: () ->
          decrypt: (password, didDecrypt, error) ->
            didDecrypt()
      }

      return

    return

  describe "setSecondPassword", ->
    beforeEach ->
      spyOn(Wallet.my.wallet, "encrypt")

    it "should call encrypt()", inject(($rootScope) ->
      Wallet.setSecondPassword()
      $rootScope.$digest()

      expect(Wallet.my.wallet.encrypt).toHaveBeenCalled()
    )

    it "should store whatsnew in localstorage", inject(($rootScope, localStorageService) ->
      spyOn(localStorageService, "set")

      Wallet.setSecondPassword()
      $rootScope.$digest()

      expect(localStorageService.set).toHaveBeenCalled()
    )


  describe "removeSecondPassword", ->
    callbacks =
      success: () =>
      error: () =>

    beforeEach ->
      spyOn(Wallet.my.wallet, "decrypt").and.callThrough()

    it "should call decrypt()", inject(($rootScope) ->
      Wallet.removeSecondPassword(callbacks.success, callbacks.error)
      $rootScope.$digest()

      expect(Wallet.my.wallet.decrypt).toHaveBeenCalled()
    )

    # Delete this test after removing the localstorage fallback
    it "should use - but not delete - the localstorage entry for whatsnew", inject(($rootScope, localStorageService) ->
      spyOn(localStorageService, "get").and.returnValue(2)
      spyOn(localStorageService, "remove")

      Wallet.removeSecondPassword(callbacks.success, callbacks.error)
      $rootScope.$digest()

      expect(localStorageService.get).toHaveBeenCalled()
      expect(localStorageService.remove).not.toHaveBeenCalled()
    )

    # Uncomment the test below after removing the local storage fallback

    # it "should use and delete the local storage entry for whatsnew", inject(($rootScope, localStorageService) ->
    #   spyOn(localStorageService, "get").and.returnValue(2)
    #   spyOn(localStorageService, "remove")
    #
    #   Wallet.removeSecondPassword(callbacks.success, callbacks.error)
    #   $rootScope.$digest()
    #
    #   expect(localStorageService.get).toHaveBeenCalled()
    #   expect(localStorageService.remove).toHaveBeenCalled()
    # )
