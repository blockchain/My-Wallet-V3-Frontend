describe "PublicCtrl", ->
  scope = undefined
  callbacks = undefined
  mockModalInstance = undefined
  $httpBackend = undefined
  $rootScope = undefined
  $cookies = undefined

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller) ->
      Wallet = $injector.get("Wallet")
      MyWallet = $injector.get("MyWallet")
      $httpBackend = $injector.get("$httpBackend")
      $cookies = $injector.get("$cookies")
      $rootScope.rootURL = "https://blockchain.info/"
      $rootScope.karma = true

      Wallet.accounts = () -> [{},{}]

      mockModalInstance =
        result: then: (confirmCallback, cancelCallback) ->
          #Store the callbacks for later when the user clicks on the OK or Cancel button of the dialog
          @confirmCallBack = confirmCallback
          @cancelCallback = cancelCallback
          return
        close: (item) ->
          #The user clicked OK on the modal dialog, call the stored confirm callback with the selected item
          @result.confirmCallBack item
          return
        dismiss: (type) ->
          #The user clicked cancel on the modal dialog, call the stored cancel callback
          @result.cancelCallback type
          return

      scope = $rootScope.$new()

      $controller "PublicCtrl",
        $scope: scope,
        $stateParams: {}

  describe "fetchLastKnownLegacyGuid()", ->

    it "should call legacy guid endpoint", inject (($http) ->
      $httpBackend.expectGET("https://blockchain.info/wallet-legacy/guid_from_cookie").respond {success: true, guid: "1234"}
      scope.fetchLastKnownLegacyGuid()
      $httpBackend.flush()
    )

    it "should return the guid if found", inject (($http) ->
      $httpBackend.expectGET("https://blockchain.info/wallet-legacy/guid_from_cookie").respond {success: true, guid: "1234"}
      guid = undefined
      scope.fetchLastKnownLegacyGuid().then((res) -> guid = res)
      $httpBackend.flush()
      expect(guid).toEqual("1234")
    )

    it "should fail if no cookie was found", ->
      $httpBackend.expectGET("https://blockchain.info/wallet-legacy/guid_from_cookie").respond {success: false}
      guid = undefined
      scope.fetchLastKnownLegacyGuid().then((res) -> guid = res)
      $httpBackend.flush()
      expect(guid).not.toBeDefined()

  describe "setLoginFormUID()", ->
    guid = undefined

    it "should set loginFormUID to null is no cookies are found", ->
      spyOn($cookies, "get").and.returnValue(undefined)
      spyOn(scope, "fetchLastKnownLegacyGuid").and.callFake () ->
        {
          then: (cb) ->
            cb(null)
            {
              catch: () ->
            }
        }

      scope.setLoginFormUID()
      scope.loginFormUID.then((res) -> guid = res)
      scope.$digest()
      expect(guid).toEqual(null)

    it "should set loginFormUID if frontend cookie is found", ->
      spyOn($cookies, "get").and.returnValue("1234")
      scope.setLoginFormUID()
      scope.loginFormUID.then((res) ->
        guid = res
      )

      scope.$digest()
      expect(guid).toEqual("1234")

    it "should fetch legacy uid if frontend cookie is not found", ->
      spyOn($cookies, "get").and.returnValue(undefined)
      spyOn(scope, "fetchLastKnownLegacyGuid").and.callFake () ->
        {
          then: (cb) ->
            cb("12345")
            {
              catch: () ->
            }
        }

      scope.setLoginFormUID()

      scope.loginFormUID.then((res) ->
        guid = res
      )

      scope.$digest()
      expect(scope.fetchLastKnownLegacyGuid).toHaveBeenCalled()
      expect(guid).toEqual("12345")

    it "should not fetch legacy uid if frontend cookie is found", ->
      spyOn($cookies, "get").and.returnValue("1234")
      spyOn(scope, "fetchLastKnownLegacyGuid").and.callFake () ->
        {
          then: (cb) ->
            cb("12345")
            {
              catch: () ->
            }
        }

      scope.setLoginFormUID()

      scope.$digest()
      expect(scope.fetchLastKnownLegacyGuid).not.toHaveBeenCalled()
