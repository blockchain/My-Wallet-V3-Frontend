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

      Wallet.status.isLoggedIn = true

      Wallet.user = {email: "steve@me.com"}

      Wallet.settings_api =
        change_email: (email, success, error) -> success()

      Wallet.settings.languages = [
        {code: "en", name: "English"}
        {code: "fr", name: "French"}
      ]

      Wallet.settings.currencies = [
        {code: "USD", name: "U.S. Dollar"}
        {code: "EUR", name: "Euro"}
      ]

      Wallet.settings_api.change_language = (-> )
      Wallet.settings_api.change_local_currency = (-> )

      Wallet.setLanguage(Wallet.settings.languages[0])
      Wallet.changeCurrency(Wallet.settings.currencies[0])

      spyOn(Wallet, "setLanguage").and.callThrough()
      spyOn(Wallet, "changeLanguage").and.callThrough()
      spyOn(Wallet, "changeCurrency").and.callThrough()

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

  describe "handling of bitcoin links", ->
    it "can be enabled", inject((Wallet) ->
      spyOn(Wallet, "handleBitcoinLinks")
      scope.setHandleBitcoinLinks()
      expect(Wallet.handleBitcoinLinks).toHaveBeenCalled()
    )

