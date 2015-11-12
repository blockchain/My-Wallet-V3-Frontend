describe "SignupCtrl", ->
  scope = undefined
  modalInstance =
    close: ->
    dismiss: ->

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, localStorageService, $rootScope, $controller) ->
      localStorageService.remove("mockWallets")

      Wallet = $injector.get("Wallet")
      MyWallet = $injector.get("MyWallet")

      MyWallet.createNewWallet = (email, pass, translation, lang, currency, success, error) -> success()
      MyWallet.isValidateBIP39Mnemonic = () -> true

      Wallet.login = (uid, pass, code, twoFactor, success, error) -> success()

      Wallet.settings_api.change_language = (-> )
      Wallet.settings_api.change_local_currency = (-> )

      scope = $rootScope.$new()

      $controller "SignupCtrl",
        $scope: scope,
        $stateParams: {},
        $modalInstance: modalInstance

      scope.isValid = [false, false]
      scope.fields.email = "a@b.com"
      scope.fields.password = "testing"
      scope.fields.confirmation = "testing"
      scope.fields.acceptedAgreement = true
      scope.form = {$error: {email: null}}
      scope.validate()

      return

    return

  it "should close", inject((Alerts) ->
    spyOn(Alerts, "clear")
    scope.close()
    expect(Alerts.clear).toHaveBeenCalled()
  )

  describe "first step", ->
    it "should be step 1", ->
      expect(scope.currentStep).toBe(1)

    it "should go to second step", ->
      scope.nextStep()
      expect(scope.currentStep).toBe(2)

    it "should not display an error if password is still empty", ->
      scope.fields.currentPassword = "test"
      scope.fields.password = ""
      scope.validate()
      expect(scope.isValid[0]).toBe(false)
      expect(scope.errors.password).toBeNull()

    # it "should display an error if password is too short", ->
    #   scope.fields.currentPassword = "test"
    #   scope.fields.password = "1"
    #   scope.validate()
    #   expect(scope.isValid[0]).toBe(false)
    #   expect(scope.errors.password).not.toBeNull()

    it "should not display an error if password confirmation is still empty", ->
      scope.fields.currentPassword = "test"
      scope.fields.password = "testing"
      scope.fields.confirmation = ""

      scope.validate()

      expect(scope.isValid[0]).toBe(false)
      expect(scope.errors.confirmation).toBeNull()

    it "should not display an error if password confirmation matches", ->
      scope.fields.currentPassword = "test"
      scope.fields.password = "testing"
      scope.fields.confirmation = "testing"

      scope.validate()

      expect(scope.isValid[0]).toBe(true)
      expect(scope.errors.confirmation).toBeNull()

    it "should display an error if password confirmation does not match", ->
      scope.fields.currentPassword = "test"
      scope.fields.password = "testing"
      scope.fields.confirmation = "wrong"

      scope.validate()

      expect(scope.isValid[0]).toBe(false)
      expect(scope.errors.confirmation).not.toBeNull()

    it "should not go to second step is invalid", ->
      scope.fields.password = "" # invalid
      scope.nextStep()
      expect(scope.currentStep).toBe(1)

    describe "wallet creation", ->

      it "should create a new wallet", (done) ->
        inject((MyWallet) ->
          spyOn(MyWallet, 'createNewWallet')
          scope.createWallet (-> )
          expect(MyWallet.createNewWallet).toHaveBeenCalled()
          done()
        )

      it "should add uid to cookieStore", (done) ->
        inject(($cookieStore) ->
          spyOn($cookieStore, 'put')
          scope.createWallet (uid) ->
            expect($cookieStore.put).toHaveBeenCalledWith('uid', uid)
            done()
        )

  describe "second step", ->
    beforeEach ->
      scope.currentStep = 2

    it "should have a list of languages", ->
      expect(scope.languages.length).toBeGreaterThan(1)

    it "should have a list of currencies", ->
      expect(scope.currencies.length).toBeGreaterThan(1)

    it "should guess the correct language", ->
      expect(scope.fields.language.code).toBe("en")

    it "should switch interface language when new language is selected", inject(($translate) ->
      spyOn($translate, "use")
      expect(scope.fields.language.code).not.toBe(scope.languages[0].code)
      scope.fields.language = scope.languages[0]
      scope.$digest()
      expect($translate.use).toHaveBeenCalledWith(scope.languages[0].code)
    )

    it "should guess the correct currency", ->
      expect(scope.fields.currency.code).toBe("USD")
