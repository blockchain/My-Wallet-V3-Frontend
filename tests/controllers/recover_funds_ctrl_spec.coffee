describe "RecoverFundsCtrl", ->
  scope = undefined

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller) ->
      Wallet = $injector.get("Wallet")
            
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