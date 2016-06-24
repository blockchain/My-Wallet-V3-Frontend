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
    address = {archived: false, label: "Hello"}
    label = ''

    Wallet.legacyAddresses = () ->
      legacyAddresses

    Wallet.changeLegacyAddressLabel = (address, label, success, error) ->
      if label
        success()
      else
        error()

    return
  )

  beforeEach ->
    $rootScope.address = Wallet.legacyAddresses()[0]
    element = $compile("<tr imported-address='address'></tr>")($rootScope)
    $rootScope.scheduleRefresh = () ->
    $rootScope.$digest()
    isoScope = element.isolateScope()

    isoScope.success = () -> true
    isoScope.error = () -> true

  it "should show the address label", ->
    expect(element.html()).toContain "address.label"

  it "should know the address label", ->
    expect(isoScope.address.label).toEqual "Hello"

  it "can be archived", ->
    address = Wallet.legacyAddresses()[0]
    expect(address.archived).toBe(false)
    isoScope.archive(address)
    expect(address.archived).toBe(true)

  it "should be able to change a label", ->
    spyOn(isoScope, 'success')

    isoScope.changeLabel('World', isoScope.success, isoScope.error)
    expect(isoScope.success).toHaveBeenCalled()

  it "should fail if no label is passed", ->
    spyOn(isoScope, 'error')

    isoScope.changeLabel('', isoScope.success, isoScope.error)
    expect(isoScope.error).toHaveBeenCalled()

  it "should be able to cancel an edit", ->
    isoScope.cancelEdit()
    expect(isoScope.status.edit).toBe(false)

  describe "showAddress", ->

    it "should open a modal", inject(($uibModal) ->
      spyOn($uibModal, 'open')
      isoScope.showAddress()
      expect($uibModal.open).toHaveBeenCalled()
    )

  describe "transfer", ->

    it "should open a modal", inject(($uibModal) ->
      spyOn($uibModal, 'open')
      isoScope.transfer()
      expect($uibModal.open).toHaveBeenCalled()
    )

  describe "showPrivKey", ->

    it "should open a modal", inject(($uibModal) ->
      spyOn($uibModal, 'open')
      isoScope.showPrivKey()
      expect($uibModal.open).toHaveBeenCalled()
    )
