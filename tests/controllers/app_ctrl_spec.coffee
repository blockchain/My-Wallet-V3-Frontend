describe "AppCtrl", ->
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

      $controller "AppCtrl",
        $scope: scope,
        $stateParams: {}



  it "should redirect to login if not logged in",  inject((Wallet, $state) ->
    expect(scope.status.isLoggedIn).toBe(false)
    spyOn($state, "go")
    scope.$broadcast("$stateChangeSuccess", {name: "home"})
    expect($state.go).toHaveBeenCalledWith("public.login-no-uid")
  )

  it "should not redirect to login if logged in",  inject((Wallet, $state) ->
    Wallet.status.isLoggedIn = true
    expect(scope.status.isLoggedIn).toBe(true)
    spyOn($state, "go")
    scope.$broadcast("$stateChangeSuccess", {name: "home"})
    expect($state.go).not.toHaveBeenCalled()

  )

  it "should dismiss all modals on state change", inject(($state, $uibModalStack) ->
    spyOn($uibModalStack, "dismissAll")
    scope.$broadcast("$stateChangeSuccess", {name: "home"})
    expect($uibModalStack.dismissAll).toHaveBeenCalled()
  )

  it "should open a popup to send",  inject(($uibModal) ->
    spyOn($uibModal, "open")
    scope.send()
    expect($uibModal.open).toHaveBeenCalled()
  )

  it "should open a popup to request",  inject(($uibModal) ->
    spyOn($uibModal, "open")
    scope.request()
    expect($uibModal.open).toHaveBeenCalled()
  )

  describe "HD upgrade", ->
    beforeEach ->
      callbacks =  {
        proceed: () ->
          console.log "proceed"
      }
      spyOn(callbacks, "proceed")

    it "should show modal if HD upgrade is needed", inject(($uibModal) ->
      spyOn($uibModal, "open").and.callThrough()
      scope.$broadcast("needsUpgradeToHD", callbacks.proceed)
      expect($uibModal.open).toHaveBeenCalled()
    )

  describe "redeem from email", ->
    it "should proceed after login", inject((Wallet, $rootScope, $timeout, $uibModal) ->

      spyOn($uibModal, 'open').and.returnValue(mockModalInstance)

      # Fulfill necessary conditions befor goal can be checked
      Wallet.status.isLoggedIn = true
      Wallet.status = { didLoadBalances: true, didLoadTransactions: true }
      Wallet.goal.claim = {code: "abcd", balance: 100000}

      $rootScope.$digest()
      $timeout.flush() # Modal won't open otherwise

      expect($uibModal.open).toHaveBeenCalled()
    )

  describe "auto logout", ->

    it "should reset the inactivity time", ->
      scope.inactivityTimeSeconds = 1
      scope.resetInactivityTime()
      expect(scope.inactivityTimeSeconds).toEqual(0)

    it "should increment the inactivity time", inject((Wallet) ->
      Wallet.status.isLoggedIn = true
      scope.inactivityInterval()
      expect(scope.inactivityTimeSeconds).toEqual(1)
    )

    it "should show the logout warning modal", inject((Wallet, Alerts) ->
      Wallet.status.isLoggedIn = true
      Wallet.settings.logoutTimeMinutes = 10
      scope.inactivityTimeSeconds = 589
      spyOn(Alerts, 'confirm').and.callThrough()
      scope.inactivityInterval()
      expect(Alerts.confirm).toHaveBeenCalled()
    )

    it "should not increment ticker when logged out", ->
      scope.inactivityInterval()
      expect(scope.inactivityTimeSeconds).toEqual(0)

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
