describe "ResetTwoFactorCtrl", ->
  scope = undefined
  WalletNetwork = undefined

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller, $http, $q) ->
      Wallet = $injector.get("Wallet")
      WalletNetwork = $injector.get("WalletNetwork")

      WalletNetwork.requestTwoFactorReset = (token, uid) ->
        if uid != ''
          $q.resolve()
        else
          $q.reject()

      WalletNetwork.getCaptchaImage = () ->
        $q.resolve({
          image: "captcha-image-blob",
          sessionToken: "token"
        })

      window.URL =
        createObjectURL: (blob) ->
          blob + "_url"

      scope = $rootScope.$new()

      $controller "ResetTwoFactorCtrl",
        $scope: scope,
        $stateParams: {},

  describe "on load", ->
    beforeEach ->
      scope.$digest()
      $httpBackend.flush()

    it "should refresh the captcha", ->
      pending()

    it "should prefill uid if known", ->
      pending()

  describe "refreshCaptcha()", ->
    it "should update captchaSrc", inject(() ->
      scope.captchaSrc = undefined
      scope.refreshCaptcha()
      scope.$digest()
      expect(scope.captchaSrc).not.toBeUndefined()
    )

    it "should reset the form field", ->
      scope.fields.captcha = "12345"
      scope.refreshCaptcha()
      scope.$digest()
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
      scope.$digest()
      scope.fields.captcha = "1zabc"
      scope.resetTwoFactor()
      scope.$digest()
      expect(WalletNetwork.requestTwoFactorReset).toHaveBeenCalledWith("token", "1234", "a@b.com", '', '', 'Help', '1zabc')

    it "should go to the next step", ->
      scope.resetTwoFactor()
      scope.$digest()
      expect(scope.currentStep).toEqual(2)

    it "on failure should not go to the next step and refresh captch", ->
      spyOn(scope, "refreshCaptcha")
      scope.fields.uid = ""

      scope.resetTwoFactor()
      scope.$digest()

      expect(scope.currentStep).toEqual(1)
      expect(scope.refreshCaptcha).toHaveBeenCalled()
