describe "SettingsPreferencesCtrl", ->
  scope = undefined
  Wallet = undefined

  modal =
    open: ->

  mockObserver = {
    success: (() ->),
    error: (() ->)}

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller) ->
      Wallet = $injector.get("Wallet")
      MyWallet = $injector.get("MyWallet")
      MyBlockchainSettings = $injector.get("MyBlockchainSettings")

      Wallet.status.isLoggedIn = true

      Wallet.user = {email: "steve@me.com"}

      Wallet.settings_api =
        changeEmail: (email, success, error) -> success()

      Wallet.settings_api = MyBlockchainSettings

      Wallet.settings.languages = [
        {code: "en", name: "English"}
        {code: "fr", name: "French"}
      ]

      Wallet.settings.currencies = [
        {code: "USD", name: "U.S. Dollar"}
        {code: "EUR", name: "Euro"}
      ]

      Wallet.settings.displayCurrency = [
        {code: "BTC", btcValue: "1 BTC", serverCode: "BTC"}
      ]

      Wallet.settings.btcCurrencies = [
        {code: "BTC", serverCode: "BTC"}
        {code: "mBTC", serverCode: "mBTC"}
        {code: "bits", serverCode: "UBC"}
      ]

      Wallet.settings_api.changeLanguage = (-> )
      Wallet.settings_api.changeLocalCurrency = (-> )
      Wallet.settings_api.changeBTCCurrency = (-> )

      Wallet.setLanguage(Wallet.settings.languages[0])
      Wallet.changeCurrency(Wallet.settings.currencies[0])

      spyOn(Wallet, "setLanguage").and.callThrough()
      spyOn(Wallet, "changeLanguage").and.callThrough()
      spyOn(Wallet, "changeCurrency").and.callThrough()
      spyOn(Wallet, "changeBTCCurrency").and.callThrough()

      scope = $rootScope.$new()

      $controller "SettingsPreferencesCtrl",
        $scope: scope,
        $stateParams: {},
        $uibModal: modal

      scope.$digest()

      return

    return

  describe "email", ->
    it "should be set on load", inject((Wallet) ->
      expect(scope.user.email).toEqual("steve@me.com")
    )

    it "should not spontaniously save", inject((Wallet) ->
      spyOn(Wallet, "changeEmail")
      expect(Wallet.changeEmail).not.toHaveBeenCalled()

      return
    )

    return

  describe "language", ->
    beforeEach ->
      scope.$digest()

    it "should be set on load", inject(() ->
      expect(Wallet.status.isLoggedIn).toBe(true)
      expect(scope.settings.language).toEqual({code: "en", name: "English"})
    )

    it "should not spontaniously save", inject((Wallet) ->
      scope.$digest()
      expect(Wallet.changeLanguage).not.toHaveBeenCalled()
    )

    it "should switch to another language", inject((Wallet) ->
      expect(scope.languages.length).toBeGreaterThan(1)
      expect(scope.settings.language).not.toBeNull()
      expect(scope.settings.language).not.toEqual(scope.languages[0]) # English is not the first one in the list

      # Switch language:
      scope.settings.language = scope.languages[0]
      scope.changeLanguage(scope.settings.language)
      expect(Wallet.changeLanguage).toHaveBeenCalledWith(scope.languages[0])
    )

  describe "currency", ->
    beforeEach ->
      scope.$digest()

    it "should not spontaniously save", inject((Wallet) ->
      scope.$digest()
      expect(Wallet.changeCurrency).not.toHaveBeenCalled()
    )

    it "can be changed", inject((Wallet) ->
      expect(scope.currencies.length).toBeGreaterThan(1)
      scope.settings.currency = scope.currencies[0]
      expect(scope.settings.currency).not.toBeNull()

      # Switch language:
      scope.settings.currency = scope.currencies[1]
      scope.changeCurrency(scope.settings.currency)
      expect(Wallet.changeCurrency).toHaveBeenCalledWith(scope.currencies[1])
    )

  describe "btc unit display", ->
    beforeEach ->
      scope.$digest()

    it "can change with a selection", inject((Wallet) ->
      expect(scope.btcCurrencies.length).toBeGreaterThan(2)
      expect(scope.settings.displayCurrency).not.toBeNull()
      scope.changeBTCCurrency(scope.btcCurrencies[1])
      expect(Wallet.changeBTCCurrency).toHaveBeenCalledWith(scope.btcCurrencies[1])
    )

  describe "handling of bitcoin links", ->
    it "can be enabled", inject((Wallet) ->
      spyOn(Wallet, "handleBitcoinLinks")
      scope.setHandleBitcoinLinks()
      expect(Wallet.handleBitcoinLinks).toHaveBeenCalled()
    )

