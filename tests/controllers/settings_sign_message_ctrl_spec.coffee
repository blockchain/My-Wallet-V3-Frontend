describe "SignMessageController", ->
  scope = undefined
  Wallet = undefined

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller) ->
      MyWallet = $injector.get('MyWallet')
      Wallet = $injector.get('Wallet')

      Wallet.legacyAddresses = () -> [
        { address: 'a', active: true, isWatchOnly: false, signMessage: (msg) -> msg + '_signed' }
        { address: 'b', active: false, isWatchOnly: false }
        { address: 'c', active: true, isWatchOnly: true }
      ]

      scope = $rootScope.$new()
      $controller "SignMessageController", $scope: scope

  it "should have all active spendable addresses", ->
    expect(scope.addresses.length).toEqual(1)
    expect(scope.addresses[0].address).toEqual('a')

  it "should select the first spendable address", ->
    expect(scope.address.address).toEqual('a')

  describe "sign", ->

    beforeEach ->
      spyOn(Wallet, 'askForSecondPasswordIfNeeded').and.returnValue({ then: (f) -> f('pw') })
      scope.message = 'message'

    it "should sign", ->
      scope.sign()
      expect(scope.message).toEqual('message_signed')
      expect(scope.signed).toEqual(true)

    it "should sign with second password", ->
      spyOn(scope.address, 'signMessage').and.callThrough()
      scope.sign()
      expect(scope.address.signMessage).toHaveBeenCalledWith('message', 'pw')
