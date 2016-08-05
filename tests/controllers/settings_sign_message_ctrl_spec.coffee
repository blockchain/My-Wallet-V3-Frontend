describe "SignMessageController", ->
  scope = undefined
  Wallet = undefined
  addressObj = undefined

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller) ->
      MyWallet = $injector.get('MyWallet')
      Wallet = $injector.get('Wallet')

      scope = $rootScope.$new()
      addressObj = { address: 'a', active: true, isWatchOnly: false, signMessage: (msg) -> msg + '_signed' };
      $controller "SignMessageController", $scope: scope, addressObj: addressObj

  it "should use the injected address object", ->
    expect(scope.address.address).toEqual('a')

  it "should format the address without a label", ->
    formatted = scope.formatLabel({ address: 'addr', label: null })
    expect(formatted).toEqual('addr')

  it "should format the address with a label", ->
    formatted = scope.formatLabel({ address: 'addr', label: 'label' })
    expect(formatted).toEqual('addr (label)')

  it "should reset the form", ->
    scope.signature = 'message_signed'
    scope.reset()
    expect(scope.signature).toEqual(false)

  describe "sign", ->

    beforeEach ->
      spyOn(Wallet, 'askForSecondPasswordIfNeeded').and.returnValue({ then: (f) -> f('pw') })
      scope.message = 'message'

    it "should sign", ->
      scope.sign()
      expect(scope.signature).toEqual('message_signed')

    it "should sign with second password", ->
      spyOn(scope.address, 'signMessage').and.callThrough()
      scope.sign()
      expect(scope.address.signMessage).toHaveBeenCalledWith('message', 'pw')
