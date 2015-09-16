describe "ClaimModalCtrl", ->

  scope = undefined
  redeemDeferred = undefined
  modalInstance =
    close: ->
    dismiss: ->

  Wallet = undefined

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, localStorageService, $rootScope, $controller, $q) ->
      localStorageService.remove("mockWallets")

      Wallet = $injector.get("Wallet")

      spyOn(Wallet, "redeemFromEmailOrMobile").and.callFake(() ->
        {
          publish: () ->
            $q (resolve, reject) ->
              resolve()
        }
      )

      Wallet.my =
        wallet: 
          isUpgradedToHD: true
          hdwallet:
            defaultAccountIndex: 0
            accounts: [{ index: 0, archived: false }]

      scope = $rootScope.$new()

      balancePromise = {
        then: (r)->
          r(100000)
      }

      $controller "ClaimModalCtrl",
        $scope: scope,
        $stateParams: {},
        $modalInstance: modalInstance
        claim: {code: "abcd", balance: balancePromise}

      scope.$digest()

      return

    return

  it "should list accounts", ->
    expect(scope.accounts().length).toBeGreaterThan(0)

  it "should fetch the redeem balance", ->
    expect(scope.balance).toBe(100000)

  it "should beep on success", inject((Wallet)->
    spyOn(Wallet, 'beep')
    scope.redeem()
    scope.$digest()
    expect(Wallet.beep).toHaveBeenCalled()
  )
