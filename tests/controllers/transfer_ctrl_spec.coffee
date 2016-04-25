describe "TransferControllerSpec", ->
  Wallet = undefined
  scope = undefined
  rootScope = undefined
  controller = undefined

  spendableAddresses = [
    { label: 'addr1', balance: 10000 },
    { label: 'addr2', balance: 20000 }
  ]

  modalInstance =
    close: ->
    dismiss: ->

  getControllerScope = (address) ->
    s = rootScope.$new()

    controller "TransferController",
      $scope: s
      $uibModalInstance: modalInstance
      address: address

    s.$digest()
    s

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller, $q) ->
      rootScope = $rootScope
      controller = $controller

      Wallet = $injector.get("Wallet")
      MyWallet = $injector.get("MyWallet")
      MyWalletPayment = $injector.get("MyWalletPayment")

      Wallet.accounts = () -> [{label: 'Savings'}, {label: 'Party Money'}]
      Wallet.legacyAddresses = () -> spendableAddresses
      Wallet.askForSecondPasswordIfNeeded = () -> $q.resolve('pw')
      Wallet.payment = () -> new MyWalletPayment()

      MyWallet.wallet = { hdwallet: { defaultAccount: { label: 'Default', index: 1 } } }

      scope = getControllerScope(spendableAddresses)

  it "should select the default account", ->
    expect(scope.selectedAccount.label).toEqual('Default')

  it "should convert a single address to an array", ->
    scope = getControllerScope({ label: 'single_address' })
    expect(Array.isArray(scope.addresses)).toEqual(true)
    expect(scope.addresses[0].label).toEqual('single_address')

  it "should combine the balances of addresses", ->
    expect(scope.combinedBalance).toEqual(30000)

  it "should set the payment array", ->
    expect(scope.payments).toBeDefined()
