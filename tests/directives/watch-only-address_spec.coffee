describe "Watch Only Address Directive", ->
  $compile = undefined
  $rootScope = undefined
  element = undefined
  isoScope = undefined
  Wallet = undefined
  MyWallet = undefined

  beforeEach module("walletApp")

  beforeEach inject((_$compile_, _$rootScope_) ->

    $compile = _$compile_
    $rootScope = _$rootScope_

    return
  )

  beforeEach ->
    element = $compile("<div watch-only-address></div>")($rootScope)
    $rootScope.$digest()
    isoScope = element.isolateScope()
    isoScope.$digest()

    isoScope.address = {}

    angular.mock.inject ($injector, $rootScope, $controller) ->
      Alerts = $injector.get("Alerts")
      Wallet = $injector.get("Wallet")

      Alerts.confirm = () ->
        then: (f) -> f(true)

  it "should be editable", ->
    success = () ->
    error = () ->

    spyOn(Wallet, "changeLegacyAddressLabel").and.callThrough()
    isoScope.changeLabel('label', success, error)

    expect(Wallet.changeLegacyAddressLabel).toHaveBeenCalled()

  it "should let users cancel out", ->
    isoScope.cancelEdit()

    expect(isoScope.status.edit).toBe(false)

  it "should let users delete", ->
    spyOn(Wallet, "deleteLegacyAddress")
    isoScope.delete()
    expect(Wallet.deleteLegacyAddress).toHaveBeenCalled()
