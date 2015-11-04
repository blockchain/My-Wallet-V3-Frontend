describe "Imported Address Directive", ->
  $compile = undefined
  $rootScope = undefined
  element = undefined
  isoScope = undefined
  Wallet = undefined


  # Load the myApp module, which contains the directive
  beforeEach module("walletApp")

  beforeEach inject((_$compile_, _$rootScope_, $injector) ->

    $compile = _$compile_
    $rootScope = _$rootScope_
    Wallet = $injector.get("Wallet")

    legacyAddresses = [{archived: false, label: "Hello"},{archived: true, label: "World"}]

    Wallet.legacyAddresses = () ->
      legacyAddresses

    return
  )

  beforeEach ->
    $rootScope.address = Wallet.legacyAddresses()[0]
    element = $compile("<tr imported-address='address'></tr>")($rootScope)
    $rootScope.$digest()
    isoScope = element.isolateScope()

  it "should show the address label", ->
    expect(element.html()).toContain "address.label"

  it "should know the address label", ->
    expect(isoScope.address.label).toEqual "Hello"


  it "can be archived", ->
    address = Wallet.legacyAddresses()[0]
    expect(address.archived).toBe(false)
    isoScope.archive(address)
    expect(address.archived).toBe(true)
