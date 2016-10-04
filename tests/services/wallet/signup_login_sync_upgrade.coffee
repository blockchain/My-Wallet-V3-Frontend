describe "walletServices", () ->
  Wallet = undefined
  errors = undefined
  callbacks = undefined

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, $q) ->

      Wallet = $injector.get("Wallet")

      Wallet.my = {
        login: (uid, password, credentials, callbacks) ->
          then: (cb) ->
            if uid == "test-2FA"
              if credentials.twoFactor && credentials.twoFactor.code?
                cb({guid: uid, sessionToken: "token"})
              else
                callbacks.needsTwoFactorCode(4)
            else
              cb({guid: uid, sessionToken: "token"})
            {
              catch: () ->
            }
        logout: () ->
          Wallet.monitor("logging_out")

        wallet:
          isUpgradedToHD: true
          hdwallet:
            isMnemonicVerified: true
            accounts: [{balance: 1, archived: false},{balance: 2, archived: false}]
          newAccount: () ->
          getHistory: () ->
            then: () ->
              then: () ->
          txList:
            transactions: () ->
              [{ result: 1, txType: 'received' }]
            fetchTxs: () ->
          keys: [{address: "some_legacy_address", label: "Old", archived: false}, {address: "some_legacy_address_without_label", label: "some_legacy_address_without_label", archived: false}]
          fetchAccountInfo: () ->
            then: (cb) ->
              cb({
                ip_lock: false
              })
          accountInfo:
            email: "a@b.com"

        createNewWallet: (email, pwd, firstAccount, language, currency, success, fail) ->
          success()
      }

      Wallet.my.fetchMoreTransactionsForAll = (success,error,allTransactionsLoaded) ->
        success()

      spyOn(Wallet,"monitor").and.callThrough()

      return

    return

  describe "login()", ->
    pending()
    beforeEach ->
      spyOn(Wallet.my, "login").and.callThrough()
      Wallet.login()

    it "should fetch and decrypt the wallet", inject((Wallet) ->
      expect(Wallet.my.login).toHaveBeenCalled()

      return
    )

    it "should update the status", inject((Wallet) ->
      expect(Wallet.status.isLoggedIn).toBe(true)
      return
    )

    it "should get the currency", inject((Wallet) ->
      expect(Wallet.settings.currency.code).toEqual "USD"
      return
    )


    it "should get a list of accounts", inject((Wallet) ->
      expect(Wallet.accounts().length).toBeGreaterThan(1)
      expect(Wallet.accounts()[0].balance).toBeGreaterThan(0)

      return
    )

    it "should get a list of legacy addresses", inject((Wallet) ->
      expect(Wallet.legacyAddresses().length).toEqual(2)

      return
    )

    it "should use address as label if no label is given", inject((Wallet) ->
      expect(Wallet.legacyAddresses()[0].label).toEqual("Old")
      expect(Wallet.legacyAddresses()[1].label).toEqual("some_legacy_address_without_label")

      return
    )

    it "should know the current IP", inject((Wallet) ->
      expect(Wallet.user.current_ip).toBeDefined()
    )

  describe "2FA login()", ->
    callbacks =
      needs2FA: () ->

    beforeEach ->
      spyOn(callbacks, "needs2FA")

    it "should ask for a code", inject((Wallet) ->
      Wallet.login("test-2FA", "password", null, callbacks.needs2FA, (()->), (()->))
      expect(callbacks.needs2FA).toHaveBeenCalled()
    )

    it "should specify the 2FA method", inject((Wallet) ->
      Wallet.login("test-2FA", "password", null, callbacks.needs2FA, (()->), (()->))
      expect(callbacks.needs2FA).toHaveBeenCalledWith(4)
    )

    it "should login with  2FA code", inject((Wallet) ->
      spyOn(Wallet.my.wallet, "fetchAccountInfo").and.callFake () -> {
        then: () -> # Do nothing, so execution stops
      }
      Wallet.settings.twoFactorMethod = 4
      Wallet.login("test-2FA", "password", "1234567", (() ->), (()->), (()->))
      expect(Wallet.my.wallet.fetchAccountInfo).toHaveBeenCalled()
    )

  describe "2FA settings", ->
    pending()
    it "can be disabled", inject((Wallet) ->
      Wallet.settings_api.unsetTwoFactor = (success) ->
        success()

      spyOn(Wallet.settings_api, "unsetTwoFactor").and.callThrough()

      Wallet.login(null, "test-2FA", "test", null, (() ->), (()->), (()->))

      Wallet.disableSecondFactor()

      expect(Wallet.settings_api.unsetTwoFactor).toHaveBeenCalled()
      expect(Wallet.settings.needs2FA).toBe(false)
      expect(Wallet.settings.twoFactorMethod).toBe(null)


    )


  describe "logout()", ->
    it "should call MyWallet.logout", inject((Wallet) ->
      spyOn(Wallet.my, "logout")
      Wallet.logout()
      expect(Wallet.my.logout).toHaveBeenCalled()

      return
    )

    return

  describe "isSyncrhonizedWithServer()", ->
    beforeEach ->

    it "should be in sync after first load", inject((Wallet) ->
      expect(Wallet.isSynchronizedWithServer()).toBe(true)
      return
    )

  describe "HD upgrade", ->
    beforeEach ->
      Wallet.my.wallet.upgradeToHDWallet = () ->
      Wallet.my.wallet.newHDWallet = () ->

    it "should prompt the user if upgrade to HD is needed", inject(($rootScope, $timeout) ->
      pending()
      spyOn($rootScope, '$broadcast').and.callThrough()

      Wallet.monitor("hd_wallets_does_not_exist")

      $timeout.flush()

      expect($rootScope.$broadcast).toHaveBeenCalled()
      expect($rootScope.$broadcast.calls.argsFor(2)[0]).toEqual("needsUpgradeToHD")
    )

  describe "signup", ->
    pending()

    it "should create a wallet", ->
      callbacks = {
        success: () ->
      }

      spyOn(callbacks, "success")

      Wallet.create("1234567890", "a@b.com","EUR", "EN", callbacks.success)

      expect(callbacks.success).toHaveBeenCalled()

    it "should not prompt user for HD upgrade", inject(($rootScope) ->
      callbacks = {
        success: (uid) ->
          Wallet.login(null, uid, "1234567890")
      }

      Wallet.create("1234567890", "a@b.com", "EUR", "EN", callbacks.success)

      spyOn($rootScope, '$broadcast').and.callThrough()

      expect($rootScope.$broadcast).not.toHaveBeenCalled()
    )


    it "should add uid to cookies", inject(($cookies) ->
      spyOn($cookies, 'put')
      Wallet.create("1234567890", "a@b.com", "EUR", "EN", callbacks.success)
      expect($cookies.put).toHaveBeenCalledWith('uid', "new_guid")
    )
