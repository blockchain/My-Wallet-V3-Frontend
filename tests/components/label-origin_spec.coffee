describe "label-origin.component", ->
  compileElement = undefined

  beforeEach module("walletApp")
  beforeEach inject(($compile, $rootScope) ->
    compileElement = (origin) ->
      $rootScope.origin = origin
      element = $compile("<label-origin origin='origin'></label-origin>")($rootScope)
      $rootScope.$digest()
      element[0]
  )

  it "should display a label", ->
    element = compileElement({ label: 'my_address', address: '1abcd' })
    expect(element.innerHTML).toContain('my_address')

  it "should display an address", ->
    element = compileElement({ address: '1abcd' })
    expect(element.innerHTML).toContain('1abcd')

  it "should display a balance", ->
    element = compileElement({ balance: 10000 })
    expect(element.innerHTML).toContain('(0.0001 BTC)')
