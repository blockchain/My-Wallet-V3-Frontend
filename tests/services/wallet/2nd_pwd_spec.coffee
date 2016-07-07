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

    it "should make a cookie for whatsnew", inject(($rootScope, $cookies) ->
      spyOn($cookies, "put")

      Wallet.setSecondPassword()
      $rootScope.$digest()

      expect($cookies.put).toHaveBeenCalled()
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

    # Delete this test after removing the cookie fallback
    it "should use - but not delete - the cookie for whatsnew", inject(($rootScope, $cookies) ->
      spyOn($cookies, "get").and.returnValue(2)
      spyOn($cookies, "remove")

      Wallet.removeSecondPassword(callbacks.success, callbacks.error)
      $rootScope.$digest()

      expect($cookies.get).toHaveBeenCalled()
      expect($cookies.remove).not.toHaveBeenCalled()
    )

    # Uncomment the test below after removing the cookie fallback

    # it "should use and delete the cookie for whatsnew", inject(($rootScope, $cookies) ->
    #   spyOn($cookies, "get").and.returnValue(2)
    #   spyOn($cookies, "remove")
    #
    #   Wallet.removeSecondPassword(callbacks.success, callbacks.error)
    #   $rootScope.$digest()
    #
    #   expect($cookies.get).toHaveBeenCalled()
    #   expect($cookies.remove).toHaveBeenCalled()
    # )
