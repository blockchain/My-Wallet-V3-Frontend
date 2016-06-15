describe "walletServices", () ->
  Wallet = undefined
  Alerts = undefined
  mockObserver = undefined
  errors = undefined
  MyBlockchainSettings = undefined

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, $q) ->
      Wallet = $injector.get("Wallet")
      MyBlockchainSettings = $injector.get("MyBlockchainSettings")
      Alerts = $injector.get('Alerts')

      spyOn(Wallet,"monitor").and.callThrough()

      mockObserver = {
        needs2FA: (() ->),
        success: (() ->),
        error: (() ->)}

      Wallet.my.login = (uid, password, credentials, callbacks) ->
        then: (cb) ->
          cb({guid: "1234", sessionToken: "token"})
          {
            catch: () ->
          }


      Wallet.my.wallet =
        isUpgradedToHD: true
        hdwallet:
          isMnemonicVerified: true
          accounts: []
        keys: []
        getNote: (-> )
        getHistory: () ->
          then: () ->
            then: () ->
        txList:
          transactions: () ->
            [{ result: 1, txType: 'received' }]
          fetchTxs: () ->

      return

    return

  describe "transactions", ->

    it "should beep on new transaction",  inject((Wallet, $timeout, ngAudio) ->
      spyOn(ngAudio, "load").and.callThrough()

      Wallet.monitor("on_tx")
      expect(ngAudio.load).toHaveBeenCalled()
    )

  describe "language", ->

    it "should be set after loading", inject((Wallet) ->

      Wallet.login()

      expect(Wallet.settings.language).toEqual({code: "en", name: "English"})
    )

    it "should switch language", inject((Wallet, languages) ->
      Wallet.settings_api.changeLanguage = (language, success, error) ->
        success()

      spyOn(Wallet.settings_api, "changeLanguage").and.callThrough()

      Wallet.changeLanguage(languages[0])
      expect(MyBlockchainSettings.changeLanguage).toHaveBeenCalled()
      expect(MyBlockchainSettings.changeLanguage.calls.argsFor(0)[0]).toBe("bg")
      expect(Wallet.settings.language.code).toBe("bg")

    )

    return


  describe "currency", ->

    it "should be set after loading", inject((Wallet) ->
      Wallet.login()
      expect(Wallet.settings.currency.code).toEqual("USD")
    )

    it "conversion should be set on load", inject((Wallet, currency) ->
      spyOn(currency, 'fetchExchangeRate')
      Wallet.login()
      expect(currency.fetchExchangeRate).toHaveBeenCalled()
    )

    it "can be switched", inject(($rootScope, Wallet, currency) ->
      Wallet.settings_api.changeLocalCurrency = (newCurrency, f) -> f()

      spyOn(Wallet.settings_api, "changeLocalCurrency").and.callThrough()
      Wallet.changeCurrency(currency.currencies[1])
      expect(MyBlockchainSettings.changeLocalCurrency).toHaveBeenCalledWith("EUR", jasmine.any(Function), jasmine.any(Function))
      expect(Wallet.settings.currency.code).toBe("EUR")
    )

    return

  describe "email", ->

    it "should be set after loading", inject((Wallet) ->
      Wallet.login()
      expect(Wallet.user.email).toEqual("steve@me.com")
    )

    it "can be changed", inject((Wallet) ->
      Wallet.settings_api.changeEmail = (newVal, success, error) -> success()

      spyOn(Wallet.settings_api, "changeEmail").and.callThrough()
      Wallet.changeEmail("other@me.com", mockObserver.success, mockObserver.error)
      expect(MyBlockchainSettings.changeEmail).toHaveBeenCalled()
      expect(Wallet.user.email).toBe("other@me.com")
      expect(Wallet.user.isEmailVerified).toBe(false)
    )

    return

  describe "mobile", ->

    it "should be set after loading", inject((Wallet) ->
      Wallet.login()
      expect(Wallet.user.mobile.number).toEqual("12345678")
    )

    it "should allow change", inject((Wallet) ->
      Wallet.settings_api.changeMobileNumber = (newVal, success, error) ->
        success()

      spyOn(Wallet.settings_api, "changeMobileNumber").and.callThrough()
      newNumber = {country: "+31", number: "0100000000"}
      Wallet.changeMobile(newNumber, (()->),(()->))
      expect(Wallet.settings_api.changeMobileNumber).toHaveBeenCalled()
      expect(Wallet.user.mobile).toBe(newNumber)
      expect(Wallet.user.isMobileVerified).toBe(false)
    )

    it "can be verified", inject((Wallet) ->
      Wallet.settings_api.verifyMobile = (code, success, error) ->
        success()

      spyOn(Wallet.settings_api, "verifyMobile").and.callThrough()

      Wallet.verifyMobile("12345", (()->),(()->))

      expect(MyBlockchainSettings.verifyMobile).toHaveBeenCalled()

      expect(Wallet.user.isMobileVerified).toBe(true)

      return
    )

    return

  describe "password", ->

    it "can be changed", inject((Wallet, MyWalletStore) ->
      spyOn(MyWalletStore, "changePassword").and.callThrough()
      Wallet.changePassword("newpassword")
      expect(MyWalletStore.changePassword).toHaveBeenCalled()
      expect(MyWalletStore.isCorrectMainPassword("newpassword")).toBe(true)
    )

    return

  describe "password hint", ->

    it "should be set after loading", inject((Wallet) ->
      Wallet.login()
      expect(Wallet.user.passwordHint).toEqual("Same as username")
    )

    it "can be changed", inject((Wallet) ->
      Wallet.settings_api.updatePasswordHint1 = (hint, success, error) ->
        if hint.split('').some((c) -> c.charCodeAt(0) > 255)
          error(101)
        else
          success()

      spyOn(Wallet.settings_api, "updatePasswordHint1").and.callThrough()
      Wallet.changePasswordHint("Better hint", mockObserver.success, mockObserver.error)
      expect(MyBlockchainSettings.updatePasswordHint1).toHaveBeenCalled()
      expect(Wallet.user.passwordHint).toBe("Better hint")
    )

    return

  describe "total()", ->
    beforeEach ->
      Wallet.status.isLoggedIn = true

    it "should return null if not logged in", ->
      Wallet.status.isLoggedIn = false
      expect(Wallet.total(0)).toEqual(null)

    describe "for an account", ->

      it "should return the balance", inject((Wallet) ->
        Wallet.accounts = () -> [{balance: 1}, {balance: 2}]

        expect(Wallet.total(0)).toBeGreaterThan(0)
        expect(Wallet.total(0)).toBe(1)
        expect(Wallet.total(1)).toBe(2)

        return
      )

      it "should return null if balance unknown", inject((Wallet) ->
        Wallet.accounts = () -> [{balance: null}]

        expect(Wallet.total(0)).toEqual(null)
        return
      )

    describe "for all", ->
      it "should return the sum of all accounts and addresses", inject((Wallet) ->

        Wallet.my.wallet.hdwallet.balanceActiveAccounts = 3
        Wallet.my.wallet.balanceActiveLegacy = 1

        expect(Wallet.total("")).toBeGreaterThan(0)
        expect(Wallet.total("")).toBe(4)

        return
      )

      # This ensures a spinner shows during load
      it "should return null if either accounts or addresses are unknown", inject((Wallet) ->

        Wallet.my.wallet.hdwallet.balanceActiveAccounts = null
        Wallet.my.wallet.balanceSpendableActiveLegacy = 1

        expect(Wallet.total("")).toBe(null)

        Wallet.my.wallet.hdwallet.balanceActiveAccounts = 1
        Wallet.my.wallet.balanceSpendableActiveLegacy = null

        expect(Wallet.total("")).toBe(null)

        return
      )

    describe "for imported addresses", ->
      it "should return the sum of all legacy addresses", inject((Wallet, MyWalletStore) ->
        Wallet.my.wallet.balanceActiveLegacy = 1

        expect(Wallet.total("imported")).toBeGreaterThan(0)
        expect(Wallet.total("imported")).toBe(1)

        return
      )

    return

  describe "addAddressOrPrivateKey()", ->
    beforeEach ->
      errors = {}

      Wallet.my.wallet.importLegacyAddress = (privateKey, label, getPassword, bip38Password) ->
        if privateKey == "BIP38 key"
          if bip38Password == "5678"
            return {
              then: (success) -> success("some address")
            }
          else
            return {
              then: (success, error) -> error("needsBip38")
            }
        else
          address = privateKey.replace("private_key_for_","")
          MyWalletStore.addLegacyAddress(address, privateKey, 200000000)
          return {
            then: (success) -> success("address")
          }

        return

    it "should recoginize an address as such", ->
      # TODO: use a spy to make sure this gets called
      success = (address) ->
        expect(address.address).toBe("valid_address")

      Wallet.addAddressOrPrivateKey("valid_address", null, success, null)

      # expect(errors).toEqual({})

    it "should derive the address corresponding to a private key", ->
      # TODO: use a spy to make sure this gets called
      success = (address) ->
        expect(address.address).toBe("valid_address")

      Wallet.addAddressOrPrivateKey("private_key_for_valid_address", null, success, null)


    it "should complain if nothing is entered", ->
      success = () ->
        expect(false).toBe(true)

      error = (errors) ->
        expect(errors.invalidInput).toBeDefined()

      Wallet.addAddressOrPrivateKey("", null, success, error)


    it "should complain if private key already exists", ->
      success = () ->
        expect(false).toBe(true)

      error = (errors, address) ->
        expect(errors.addressPresentInWallet).toBeDefined()

      address = Wallet.addAddressOrPrivateKey("private_key_for_some_legacy_address", null, success, error)

    it "should complain if a watch-only address already exists", ->
      success = () ->
        expect(false).toBe(true)

      error = (errors) ->
        expect(errors.addressPresentInWallet).toBeDefined()

      Wallet.addAddressOrPrivateKey("some_legacy_watch_only_address", null, success, error)

    it "should add private key to existing watch-only address", ->
      success = (address) ->
        expect(Wallet.legacyAddresses[1].isWatchOnlyLegacyAddress).toBe(false)
        expect(address.address).toBe("some_legacy_watch_only_address")

      error = () ->
        expect(false).toBe(true)

      Wallet.addAddressOrPrivateKey("private_key_for_some_legacy_watch_only_address", null, success, error)

    it "should complain if input is invalid", ->
      success = () ->
        expect(false).toBe(true)

      error = (errors) ->
        expect(errors.invalidInput).toBeDefined()

      Wallet.addAddressOrPrivateKey("invalid address", null, success, error)

    it "should ask for BIP 38 password if needed", inject(($rootScope) ->
      callbacks = {
        success: () ->
        error: () ->
        needsBip38: () ->
      }

      spyOn(callbacks, "error")
      spyOn(callbacks, "needsBip38")

      Wallet.addAddressOrPrivateKey("BIP38 key", callbacks.needsBip38, callbacks.success, callbacks.error)

      $rootScope.$digest()

      expect(callbacks.needsBip38).toHaveBeenCalled()
    )

  describe "notifications", ->
    describe "on_tx", ->
      beforeEach ->
        spyOn(Alerts, "displayReceivedBitcoin")

      it "should display a message if the user received bitcoin", ->
        spyOn(Wallet.my.wallet.txList, 'transactions').and.callFake () ->
          [{ result: 1, txType: 'received' }]

        Wallet.monitor("on_tx")
        expect(Alerts.displayReceivedBitcoin).toHaveBeenCalled()

      it "should not display a message if the user spent bitcoin", ->
        spyOn(Wallet.my.wallet.txList, 'transactions').and.callFake () ->
          [{ result: -1, txType: 'sent' }]

        Wallet.monitor("on_tx")
        expect(Alerts.displayReceivedBitcoin).not.toHaveBeenCalled()

      it "should not display a message if the user moved bitcoin between accounts", ->
        spyOn(Wallet.my.wallet.txList, 'transactions').and.callFake () ->
          [{ result: 0, txType: 'transferred' }]

        Wallet.monitor("on_tx")
        expect(Alerts.displayReceivedBitcoin).not.toHaveBeenCalled()

  describe "toggleDisplayCurrency()", ->

    it "should toggle from btc to fiat", inject((Wallet) ->
      Wallet.settings.displayCurrency = Wallet.settings.btcCurrency
      Wallet.toggleDisplayCurrency()
      expect(Wallet.settings.displayCurrency).toBe(Wallet.settings.currency)
    )

    it "should toggle from fiat to btc", inject((Wallet) ->
      Wallet.settings.displayCurrency = Wallet.settings.currency
      Wallet.toggleDisplayCurrency()
      expect(Wallet.settings.displayCurrency).toBe(Wallet.settings.currency)
    )

  describe "Two factor settings", ->

    it "should disable 2FA", inject((Wallet) ->
      Wallet.settings.needs2FA = true
      Wallet.disableSecondFactor()
      expect(Wallet.settings.needs2FA).toEqual(false)
      expect(Wallet.settings.twoFactorMethod).toEqual(null)
    )

    it "should set two factor as SMS", inject((Wallet) ->
      Wallet.settings.needs2FA = false
      Wallet.setTwoFactorSMS()
      expect(Wallet.settings.needs2FA).toEqual(true)
      expect(Wallet.settings.twoFactorMethod).toEqual(5)
    )

    it "should set two factor as Email", inject((Wallet) ->
      Wallet.settings.needs2FA = false
      Wallet.setTwoFactorEmail()
      expect(Wallet.settings.needs2FA).toEqual(true)
      expect(Wallet.settings.twoFactorMethod).toEqual(2)
    )

    it "should set two factor as Yubikey", inject((Wallet) ->
      Wallet.settings.needs2FA = false
      Wallet.setTwoFactorYubiKey('yubikey_code', (() -> ))
      expect(Wallet.settings.needs2FA).toEqual(true)
      expect(Wallet.settings.twoFactorMethod).toEqual(1)
    )

    it "should set Google Authenticator secret", inject((Wallet) ->
      Wallet.setTwoFactorGoogleAuthenticator()
      expect(Wallet.settings.googleAuthenticatorSecret).toEqual('secret_sauce')
    )

    it "should confirm two factor as Google Authenticator with correct code", inject((Wallet) ->
      Wallet.settings.needs2FA = false
      Wallet.confirmTwoFactorGoogleAuthenticator('secret_sauce', (() -> ))
      expect(Wallet.settings.needs2FA).toEqual(true)
      expect(Wallet.settings.twoFactorMethod).toEqual(4)
      expect(Wallet.settings.googleAuthenticatorSecret).toEqual(null)
    )

    it "should not confirm two factor as Google Authenticator with incorrect code", inject((Wallet) ->
      Wallet.settings.needs2FA = false
      Wallet.confirmTwoFactorGoogleAuthenticator('wrong', null, (() -> ))
      expect(Wallet.settings.needs2FA).toEqual(false)
      expect(Wallet.settings.twoFactorMethod).toEqual(null)
    )

    it "should enable rememberTwoFactor", inject((Wallet) ->
      Wallet.settings.rememberTwoFactor = false
      Wallet.enableRememberTwoFactor((() -> ))
      expect(Wallet.settings.rememberTwoFactor).toEqual(true)
    )

    it "should disable rememberTwoFactor", inject((Wallet) ->
      Wallet.settings.rememberTwoFactor = true
      Wallet.disableRememberTwoFactor((() -> ))
      expect(Wallet.settings.rememberTwoFactor).toEqual(false)
    )

  describe "legacyAddresses()", ->
    beforeEach ->
      Wallet.status.isLoggedIn = true

    it "should return an array of legacy addresses", ->
      expect(Wallet.legacyAddresses()).toEqual([])

    it "should be null if not logged in", ->
      Wallet.status.isLoggedIn = false
      expect(Wallet.legacyAddresses()).toBe(null)

  describe "accounts()", ->
    beforeEach ->
      Wallet.status.isLoggedIn = true

    it "should return an array of accounts", ->
      expect(Wallet.accounts()).toEqual([])

    it "should be null if not logged in", ->
      Wallet.status.isLoggedIn = false
      expect(Wallet.accounts()).toBe(null)
