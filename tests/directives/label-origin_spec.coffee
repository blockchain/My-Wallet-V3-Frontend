describe "Label Origin Directive", ->
  $compile = undefined
  $rootScope = undefined
  element = undefined
  isoScope = undefined
  Wallet = undefined

  beforeEach module("walletApp")

  beforeEach inject((_$compile_, _$rootScope_, Wallet) ->

    $compile = _$compile_
    $rootScope = _$rootScope_

    return
  )

  beforeEach ->
    element = $compile("<label-origin></label-origin>")($rootScope)
    $rootScope.$digest()
    isoScope = element.isolateScope()
    isoScope.$digest()

    angular.mock.inject ($injector, $rootScope, $controller) ->
      Wallet = $injector.get("Wallet")

  it "should have access to settings", ->
    expect(isoScope.settings).toBe(Wallet.settings)

  describe "determineAvailableBalance function", ->

    it "should return a balance", ->
      final = isoScope.determineAvailableBalance(100)
      expect(final).toBe(100)

    it "should return 0 if available balance is less than 0", ->
      final = isoScope.determineAvailableBalance(-1)
      expect(final).toBe(0)

    it "should subtract a fee from the balance", ->
      isoScope.fee = 5
      final = isoScope.determineAvailableBalance(100)

      expect(final).toBe(95)

    it "should return undefined if no balance is passed", ->
      final = isoScope.determineAvailableBalance()
      expect(final).toBeUndefined()

  describe "determineLabel function", ->

    it "should return a label", ->
      origin = {
        label: 'label'
      }
      label = isoScope.determineLabel(origin)
      expect(label).toBe('label')

  return
