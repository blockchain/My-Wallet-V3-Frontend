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

  describe "setLoginFormUID()", ->
    guid = undefined

    it "should set loginFormUID to null is no cookies are found", ->
      spyOn($cookies, "get").and.returnValue(undefined)


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
