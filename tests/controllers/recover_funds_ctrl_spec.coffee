describe "RecoverFundsCtrl", ->
  scope = undefined
  Wallet = undefined

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller) ->
      Wallet = $injector.get("Wallet")

      Wallet.login = (guid, pw, success, error) -> success()
      Wallet.my.recoverFromMnemonic = (email, password, mnemonic, bip39, success, error) ->
        success({email,password,mnemonic,bip39})

      Wallet.my.browserCheck = () -> true

      scope = $rootScope.$new()

      $controller "RecoverFundsCtrl",
        $scope: scope

      scope.$digest()

      scope.fields = {
        mnemonic: 'bitcoin is not just a currency it is a way of life'
      }

      return

    return

  describe "recover funds", ->

    it "should start at step 1", ->
      expect(scope.currentStep).toBe(1)

    it "should get a valid mnemonic length", ->
      scope.getMnemonicLength()
      expect(scope.isValidMnemonicLength).toBeTruthy()

    it "should be able to increase steps", ->
      scope.nextStep()
      scope.$digest()
      expect(scope.currentStep).toBe(2)

    it "should be able to go back steps", ->
      scope.goBack()
      expect(scope.currentStep).toBe(0)

    describe "performImport function", ->

      it "should stop 'working' after callback", inject(($timeout) ->
        spyOn(Wallet, "login")
        scope.performImport()
        expect(scope.working).toBe(false)
        $timeout.flush()
      )
