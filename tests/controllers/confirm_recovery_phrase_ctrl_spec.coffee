describe "ConfirmRecoveryPhraseCtrl", ->
  scope = undefined
  modalInstance =
    close: ->
    dismiss: ->

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller) ->
      Wallet = $injector.get("Wallet")
      MyWallet = $injector.get("MyWallet")

      scope = $rootScope.$new()

      $controller "ConfirmRecoveryPhraseCtrl",
        $scope: scope,
        $stateParams: {},
        $modalInstance: modalInstance

      return

    return

  it "should get mnemonic", inject((Wallet) ->
    expect(scope.recoveryPhrase).not.toBe(null)
    return
  )

  it "should verify", inject((Wallet) ->

    for word in scope.words
      word.value = word.actual

    scope.$apply()

    spyOn(Wallet, "confirmRecoveryPhrase")

    scope.verify()

    expect(Wallet.confirmRecoveryPhrase).toHaveBeenCalled()
    expect(scope.step).toBe(3)

    return
  )

  describe "pure coverage", ->
    it "covers close", ->
      scope.close()

    it "covers goToVerify", ->
      scope.goToVerify()