describe "LostGuidCtrl", ->
  scope = undefined
  WalletNetwork = undefined

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller, $http) ->
      Wallet = $injector.get("Wallet")
      WalletNetwork = $injector.get("WalletNetwork")

      WalletNetwork.recoverGuid = (token, email, captcha) -> {
        then: (callback) ->
          if captcha != ""
            callback()
          {
            catch: (callback) ->
              if captcha == ""
                callback()
          }
      }

      WalletNetwork.getCaptchaImage = () -> {
        then: (cb) ->
          cb({
            image: "captcha-image-blob",
            sessionToken: "token"
          })
      }

      window.URL =
        createObjectURL: (blob) ->
          blob + "_url"

      scope = $rootScope.$new()

      $controller "LostGuidCtrl",
        $scope: scope,
        $stateParams: {},

      return

    return

  describe "on load", ->
    beforeEach ->
      scope.$digest()

    it "should refresh the captcha", ->
      pending()
      # This won't work:
      # expect(scope.refreshCaptcha).toHaveBeenCalled()
      # Possible workaround: http://stackoverflow.com/a/33605369

    it "should prefill uid if known", ->
      pending()

  describe "refreshCaptcha()", ->
    it "should update captchaSrc", inject(() ->
      scope.captchaSrc = undefined
      scope.refreshCaptcha()
      expect(scope.captchaSrc).not.toBeUndefined()
    )

    it "should reset the form field", ->
      scope.fields.captcha = "12345"
      scope.refreshCaptcha()
      expect(scope.fields.captcha).toEqual("")

  describe "sendReminder()", ->
    beforeEach ->
      spyOn(WalletNetwork, "recoverGuid").and.callThrough()
      scope.form =
        $setPristine: () ->
        $setUntouched: () ->

      scope.fields =
        email: 'a@b.com',
        captcha: '1zabc'

    it "should call recoverGuid() with form data", ->
      scope.sendReminder()
      expect(WalletNetwork.recoverGuid).toHaveBeenCalledWith("token", "a@b.com", "1zabc")

    it "should go to the next step", ->
      scope.sendReminder()
      expect(scope.currentStep).toEqual(2)

    it "on failure should not go to the next step and refresh captch", ->
      spyOn(scope, "refreshCaptcha")
      scope.fields.captcha = ""

      scope.sendReminder()

      expect(scope.currentStep).toEqual(1)
      expect(scope.refreshCaptcha).toHaveBeenCalled()
