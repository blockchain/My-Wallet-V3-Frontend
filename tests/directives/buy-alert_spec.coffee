describe "Buy alert message", ->
  $compile = undefined
  element = undefined
  scope = undefined
  Wallet = undefined
  $cookies = undefined

  beforeEach module("walletApp")

  beforeEach inject((_$compile_, _$rootScope_, $injector) ->
    $compile = _$compile_
    $rootScope = _$rootScope_
    scope = $rootScope.$new()

    $cookies = $injector.get("$cookies")

    return
  )

  beforeEach ->
    element = $compile("<buy-alert></buy-alert>")(scope)
    scope.$apply()

  it "should dismiss the message", ->
    spyOn($cookies, 'put')
    scope.dismissMessage()
    expect(scope.dismissed).toBe(true)
    expect($cookies.put).toHaveBeenCalled()

  it "should reveal the message", ->
    scope.revealMsg()
    expect(scope.reveal).toBe(true)
