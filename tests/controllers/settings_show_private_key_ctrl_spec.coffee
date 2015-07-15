ddescribe "ShowPrivateKeyCtrl", ->

  Wallet = null
  scope = undefined

  modalInstance =
    close: ->
    dismiss: ->

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller) ->

      Wallet = $injector.get('Wallet')
      
      Wallet.my = 
        wallet: {
          getPrivateKeyForAddress: (()-> "private key")
        }

      scope = $rootScope.$new()

      $controller "ShowPrivateKeyCtrl",
        $scope: scope,
        $modalInstance: modalInstance
        addressObj: {
          active: true
          address: 'some_legacy_address'
          balance: 10000000
          isWatchOnlyLegacyAddress: false
          label: 'Old'
          legacy: true
        }

      scope.$digest()

      return

    return

  it "should have scope variables defined", () ->
    expect(scope.address).toBeDefined()
    expect(scope.balance).toBeDefined()
    expect(scope.privKey).toBeDefined()

  it "should be dismissed", ->
    spyOn(modalInstance, "dismiss")
    scope.close()
    expect(modalInstance.dismiss).toHaveBeenCalled()

  describe "tryContinue", ->

    beforeEach ->
      scope.needsSecondPassword = true
      Wallet.my.isCorrectSecondPassword = (-> false)
      Wallet.my.wallet = 
        isDoubleEncrypted: false

    it "should allow access if there is no second password", () ->
      scope.needsSecondPassword = false
      expect(scope.accessAllowed).toBe(false)
      scope.tryContinue()
      scope.$digest()
      expect(scope.accessAllowed).toBe(true)

    it "should check to see if the second password is correct", inject((Wallet) ->
      spyOn(Wallet.my, 'isCorrectSecondPassword')
      scope.needsSecondPassword = true
      scope.tryContinue()
      expect(Wallet.my.isCorrectSecondPassword).toHaveBeenCalled()
    )

    it "should not continue if second password is incorrect", inject((Wallet) ->
      expect(scope.accessAllowed).toBe(false)
      scope.tryContinue()
      expect(scope.accessAllowed).toBe(false)
      expect(scope.incorrectSecondPassword).toBe(true)
    )

    it "should continue if second password is correct", inject((Wallet) ->
      Wallet.my.isCorrectSecondPassword = (-> true)
      expect(scope.accessAllowed).toBe(false)
      scope.tryContinue()
      expect(scope.accessAllowed).toBe(true)
      expect(scope.incorrectSecondPassword).toBe(false)
    )

  describe "checkForSecondPassword", () ->

    it "should be called on initialization", () ->
      expect(scope.needsSecondPassword).toBeDefined()

    it "should return true if there is a second password", inject((Wallet) ->
      Wallet.my.isCorrectSecondPassword = (-> false)
      scope.needsSecondPassword = scope.checkForSecondPassword()
      expect(scope.needsSecondPassword).toBe(true)
    )
