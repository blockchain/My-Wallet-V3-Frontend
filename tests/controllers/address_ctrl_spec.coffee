describe "AddressCtrl", ->
  scope = undefined
  Wallet = undefined

  modal =
    open: ->

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller) ->
      Wallet = $injector.get("Wallet")
      MyWallet = $injector.get("MyWallet")

      MyWallet.wallet = {
        keys: [{ address: 'some_legacy_address', label: 'Old' }]
        hdwallet: {
          accounts: [{
            receiveAddress: { address: 'hd_account_address' }
          }]
        }
      }

      Wallet.changeAddressLabel = (-> )

      scope = $rootScope.$new()

      $controller "AddressCtrl",
        $scope: scope,
        $stateParams: {address: "some_legacy_address"}
        $uibModal: modal

    scope.$digest()

  it "should show the address and label",  inject((Wallet) ->
    expect(scope.address).toBeDefined()
    expect(scope.address.address).toBe("some_legacy_address")
    expect(scope.address.label).toBe("Old")
  )

  it "should change the address",  inject((Wallet) ->
    spyOn(Wallet, "changeLegacyAddressLabel").and.callThrough()
    scope.changeLabel("New Label", (()->))
    expect(Wallet.changeLegacyAddressLabel).toHaveBeenCalled()
  )
