describe "TransactionCtrl", ->
  scope = undefined
  stateMock = undefined

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller) ->
      Wallet = $injector.get("Wallet")

      Wallet.accounts = () -> [{balance: 0, label: "Savings", index: 0}]

      Wallet.legacyAddresses = () ->
        [
          {address: "some_legacy_address", label: "Old"},
          {address: "some_legacy_address_without_label", label: null}
        ]

      Wallet.my.wallet =
        txList:
          transactions: () -> [
            {
              hash: 'aaaa',
              processedInputs: [{ change: false, address: 'Old' }],
              processedOutputs: [{ change: false, address: 'Savings' }, { change: true, address: '1asdf' }]
            }
          ]
          transaction: () ->
            Wallet.my.wallet.txList.transactions()[0]

      spyOn(Wallet, "getAddressBookLabel").and.returnValue(null)

      stateMock =
        go: () ->

      scope = $rootScope.$new()

      $controller "TransactionCtrl",
        $scope: scope,
        $state: stateMock,
        $stateParams: {hash: "aaaa"}

      scope.$digest()

  it "should show the correct transaction", ->
    expect(scope.transaction.hash).toBe("aaaa")

  it "should be able to go back", ->
    spyOn(stateMock, 'go')
    scope.backToTransactions()
    expect(stateMock.go).toHaveBeenCalled()

  it "should get the formatted input", ->
    expect(scope.input.label).toEqual('Old')

  it "should get the formatted destinations", ->
    expect(scope.destinations.length).toEqual(1)
    expect(scope.destinations[0].label).toEqual('Savings')
