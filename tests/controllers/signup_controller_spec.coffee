describe "SignupCtrl", ->
  scope = undefined
  modalInstance =
    close: ->
    dismiss: ->

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller) ->
      Wallet = $injector.get("Wallet")

      Wallet.login = (uid, pass, code, twoFactor, success, error) -> success()
      Wallet.create = (password, email, currency, language, success) -> success("new_guid")
      Wallet.settings_api =
        change_language: (code, success) -> success()
        change_local_currency: () ->
      Wallet.changeCurrency = () ->


      scope = $rootScope.$new()

      $controller "SignupCtrl",
        $scope: scope,
        $stateParams: {},
        $uibModalInstance: modalInstance

      scope.validate()

      return

    return

  it "should close", inject((Alerts) ->
    spyOn(Alerts, "clear")
    scope.close()
    expect(Alerts.clear).toHaveBeenCalled()
  )

  it "should have initial values", ->
    expect(scope.fields.email).toBeDefined()
    expect(scope.fields.password).toBeDefined()
    expect(scope.fields.confirmation).toBeDefined()
    expect(scope.fields.acceptedAgreement).toBe(false)

  describe "password", ->
    beforeEach ->
      scope.fields.acceptedAgreement = true
      scope.fields.email = "a@b.com"

    it "should not display an error if password confirmation matches", ->
      scope.fields.password = "testing"
      scope.fields.confirmation = "testing"

      scope.validate()

      expect(scope.isValid).toBe(true)
      expect(scope.errors.confirmation).toBeNull()

    it "should not display an error if password is still empty", ->
      scope.fields.password = ""
      scope.validate()
      expect(scope.isValid).toBe(false)
      expect(scope.errors.password).toBeNull()

    it "should not display an error if password confirmation is still empty", ->
      scope.fields.password = "testing"
      scope.fields.confirmation = ""

      scope.validate()

      expect(scope.isValid).toBe(false)
      expect(scope.errors.confirmation).toBeNull()

    it "should display an error if password confirmation does not match", ->
      scope.fields.password = "testing"
      scope.fields.confirmation = "wrong"

      scope.validate()

      expect(scope.isValid).toBe(false)
      expect(scope.errors.confirmation).not.toBeNull()

  describe "agreement", ->
    beforeEach ->
      scope.fields.email = "a@b.com"
      scope.fields.password = "1234"
      scope.fields.confirmation = "1234"

    it "should not be signed by default", ->
      expect(scope.fields.acceptedAgreement).toBe(false)

    it "should be signed by the user to register", ->
      expect(scope.isValid).toBe(false)
      scope.fields.acceptedAgreement = true

      scope.validate()
      expect(scope.isValid).toBe(true)

  it "should not register when invalid", ->
    scope.fields.password = "" # invalid
    scope.validate()
    spyOn(scope, "signup")
    scope.trySignup()
    expect(scope.signup).not.toHaveBeenCalled()

  describe "signup()", ->
    shouldBeValid = true
    beforeEach ->
      spyOn(scope, "validate").and.callFake(() ->
        scope.isValid = shouldBeValid # Side-effect
        shouldBeValid
      )


    it "should validate once more", ->
      scope.signup()
      expect(scope.validate).toHaveBeenCalled()

      # Check the test is configured correctly:
      expect(scope.isValid).toBe(true)

    it "should call createWallet()", ->
      spyOn(scope, "createWallet")
      scope.signup()
      expect(scope.createWallet).toHaveBeenCalled()

    it "should not call createWallet() if validation failed", ->
      spyOn(scope, "createWallet")
      shouldBeValid = false
      scope.signup()
      expect(scope.createWallet).not.toHaveBeenCalled()
      shouldBeValid = true # Sorry...


    it "should create a new wallet", inject((Wallet) ->
      spyOn(Wallet, 'create')
      scope.createWallet (-> )
      expect(Wallet.create).toHaveBeenCalled()
    )

    it "should add uid to cookieStore", inject(($cookieStore) ->
      spyOn($cookieStore, 'put')
      scope.signup()
      expect($cookieStore.put).toHaveBeenCalledWith('uid', "new_guid")
    )

    it "should add password to cookieStore in dev mode", inject(($cookieStore) ->
      spyOn($cookieStore, 'put')
      scope.savePassword = true
      scope.fields.password = "testing"

      scope.signup()
      expect($cookieStore.put).toHaveBeenCalledWith('password', "testing")
    )

    it "should not add password to cookieStore in production mode", inject(($cookieStore) ->
      spyOn($cookieStore, 'put')
      scope.savePassword = false
      scope.fields.password = "testing"

      scope.signup()
      expect($cookieStore.put).not.toHaveBeenCalledWith('password', "testing")
    )

  describe "language", ->
    it "should guess the correct language", ->
      expect(scope.language_guess.code).toBe("en")

    it "should switch interface language to guessed language", inject(($translate, languages) ->
      spyOn($translate, "use")
      expect(scope.language_guess.code).not.toBe(languages[0].code)
      scope.language_guess = languages[0]
      scope.$digest()
      expect($translate.use).toHaveBeenCalledWith(languages[0].code)
    )

  describe "currency", ->
    it "should guess the correct currency", ->
      expect(scope.currency_guess.code).toBe("USD")

    it "should switch to the guessed currency", inject((currency, Wallet) ->
      spyOn(Wallet, "changeCurrency")
      expect(scope.currency_guess.code).not.toBe(currency.currencies[1].code)
      scope.currency_guess = currency.currencies[1]
      scope.$digest()
      expect(Wallet.changeCurrency).toHaveBeenCalledWith(currency.currencies[1])
    )
