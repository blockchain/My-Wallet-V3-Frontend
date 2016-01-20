describe "ResetTwoFactorCtrl", ->
  scope = undefined
  $httpBackend = undefined
  WalletNetwork = undefined

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller, $http) ->
      Wallet = $injector.get("Wallet")
      WalletNetwork = $injector.get("WalletNetwork")
      $httpBackend = $injector.get("$httpBackend")

      $httpBackend.when("HEAD", '/wallet/login').respond({})

      WalletNetwork.requestTwoFactorReset = (uid) -> {
        then: (callback) ->
          if uid != ""
            callback()
          {
            catch: (callback) ->
              if uid == ""
                callback()
          }
      }

      scope = $rootScope.$new()

      $controller "ResetTwoFactorCtrl",
        $scope: scope,
        $stateParams: {},

      return

    return

  describe "on load", ->
    beforeEach ->
      spyOn(scope, "refreshCaptcha")

      $httpBackend.expect("HEAD", '/wallet/login')
      scope.$digest()
      $httpBackend.flush()

    it "should get a cookie", ->
      $httpBackend.verifyNoOutstandingExpectation()
      $httpBackend.verifyNoOutstandingRequest()

    it "should refresh the captcha", ->
      expect(scope.refreshCaptcha).toHaveBeenCalled()

    it "should prefill uid if known", ->
      pending()

  describe "refreshCaptcha()", ->
    it "should update captchaSrc", inject(() ->
      expect(scope.captchaSrc).toBeUndefined()
      scope.refreshCaptcha()
      expect(scope.captchaSrc).not.toBeUndefined()
    )

    it "should reset the form field", ->
      scope.fields.captcha = "12345"
      scope.refreshCaptcha()
      expect(scope.fields.captcha).toEqual("")

  describe "resetTwoFactor()", ->
    beforeEach ->
      spyOn(WalletNetwork, "requestTwoFactorReset").and.callThrough()
      scope.form =
        $setPristine: () ->
        $setUntouched: () ->

      scope.fields =
        uid: "1234",
        email: 'a@b.com',
        newEmail: '',
        secret: '',
        message: 'Help',
        captcha: '1zabc'

    it "should call requestTwoFactorReset() with form data", ->
      scope.resetTwoFactor()
      expect(WalletNetwork.requestTwoFactorReset).toHaveBeenCalledWith("1234", "a@b.com", '', '', 'Help', '1zabc')

    it "should go to the next step", ->
      scope.resetTwoFactor()
      expect(scope.currentStep).toEqual(2)

    it "on failure should not go to the next step and refresh captch", ->
      spyOn(scope, "refreshCaptcha")
      scope.fields.uid = ""

      scope.resetTwoFactor()

      expect(scope.currentStep).toEqual(1)
      expect(scope.refreshCaptcha).toHaveBeenCalled()
