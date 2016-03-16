describe "ShowPrivateKeyCtrl", ->

  Wallet = undefined
  scope = undefined
  addressObj = undefined
  askForSecondPassword = undefined

  modalInstance =
    close: ->
    dismiss: ->

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller) ->

      MyWallet = $injector.get('MyWallet')
      MyWalletHelpers = $injector.get('MyWalletHelpers')
      Wallet = $injector.get('Wallet')

      MyWallet.wallet = {
        getPrivateKeyForAddress: (-> )
      }

      MyWalletHelpers.detectPrivateKeyFormat = () -> 'base58'
      MyWalletHelpers.privateKeyStringToKey = () -> { toWIF: (->) }

      scope = $rootScope.$new()

      addressObj = {
        archived: false
        address: 'some_legacy_address'
        balance: 10000000
        label: 'Old'
      }

      $controller "ShowPrivateKeyCtrl",
        $scope: scope,
        $uibModalInstance: modalInstance
        addressObj: addressObj

      scope.$digest()

  it "should have scope variables defined", () ->
    expect(scope.address).toBeDefined()
    expect(scope.balance).toBeDefined()

  it "should be dismissed", ->
    spyOn(modalInstance, "dismiss")
    scope.close()
    expect(modalInstance.dismiss).toHaveBeenCalled()

  describe "tryContinue", ->

    beforeEach ->
      angular.mock.inject ($q) ->
        askForSecondPassword = $q.defer()
        spyOn(Wallet, 'askForSecondPasswordIfNeeded').and.returnValue(askForSecondPassword.promise)
        spyOn(Wallet.my.wallet, 'getPrivateKeyForAddress')

    it "should allow access if there is no second password", () ->
      expect(scope.accessAllowed).toBe(false)
      scope.tryContinue()
      expect(Wallet.askForSecondPasswordIfNeeded).toHaveBeenCalled()
      askForSecondPassword.resolve()
      scope.$digest()
      expect(Wallet.my.wallet.getPrivateKeyForAddress).toHaveBeenCalledWith(addressObj, undefined)
      expect(scope.accessAllowed).toBe(true)

    it "should not continue if second password is incorrect", inject((Wallet) ->
      expect(scope.accessAllowed).toBe(false)
      scope.tryContinue()
      expect(Wallet.askForSecondPasswordIfNeeded).toHaveBeenCalled()
      askForSecondPassword.reject()
      scope.$digest()
      expect(Wallet.my.wallet.getPrivateKeyForAddress).not.toHaveBeenCalled()
      expect(scope.accessAllowed).toBe(false)
    )

    it "should continue if second password is correct", inject((Wallet) ->
      expect(scope.accessAllowed).toBe(false)
      scope.tryContinue()
      expect(Wallet.askForSecondPasswordIfNeeded).toHaveBeenCalled()
      askForSecondPassword.resolve('password123')
      scope.$digest()
      expect(Wallet.my.wallet.getPrivateKeyForAddress).toHaveBeenCalledWith(addressObj, 'password123')
      expect(scope.accessAllowed).toBe(true)
    )
