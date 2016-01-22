describe "LostGuidCtrl", ->
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

      WalletNetwork.recoverGuid = (email, captcha) -> {
        then: (callback) ->
          if captcha != ""
            callback()
          {
            catch: (callback) ->
              if captcha == ""
                callback()
          }
      }

      scope = $rootScope.$new()

      $controller "LostGuidCtrl",
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
      expect(WalletNetwork.recoverGuid).toHaveBeenCalledWith("a@b.com", "1zabc")

    it "should go to the next step", ->
      scope.sendReminder()
      expect(scope.currentStep).toEqual(2)

    it "on failure should not go to the next step and refresh captch", ->
      spyOn(scope, "refreshCaptcha")
      scope.fields.captcha = ""

      scope.sendReminder()

      expect(scope.currentStep).toEqual(1)
      expect(scope.refreshCaptcha).toHaveBeenCalled()
