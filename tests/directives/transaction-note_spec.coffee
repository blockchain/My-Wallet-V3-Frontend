describe "Transaction Note Directive", ->
  $compile = undefined
  $rootScope = undefined
  element = undefined
  isoScope = undefined
  Wallet = undefined

  beforeEach module('walletDirectives');
  beforeEach module("walletApp")

  # Store references to $rootScope and $compile
  # so they are available to all tests in this describe block
  beforeEach inject((_$compile_, _$rootScope_, Wallet) ->

    # The injector unwraps the underscores (_) from around the parameter names when matching
    $compile = _$compile_
    $rootScope = _$rootScope_

    Wallet.getLabelledHdAddresses = () -> [{'address': '123', 'label': 'label label label fun'}]

    $rootScope.transaction = {note: "Hello World", processedOutputs: [{'address': '123', 'identity': 1}], txType: 'received'}
    $rootScope.account = 1

    return
  )

  beforeEach ->
    element = $compile("<transaction-note transaction='transaction' account='account'></transaction-note>")($rootScope)
    $rootScope.$digest()
    isoScope = element.isolateScope()

  it "should show the note", ->
    expect(element.html()).toContain "Hello World"

  it "should have the note in its scope", ->
    expect(isoScope.transaction.note).toBe("Hello World")

  it "should show only the note if no address labels match the tx", inject((Wallet) ->
    Wallet.getLabelledHdAddresses = () -> [{'address': '123123123nomatch', 'label': 'label label label fun'}]
    element = $compile("<transaction-note transaction='transaction' account='account'></transaction-note>")($rootScope)
    $rootScope.$digest()
    isoScope = element.isolateScope()
    addressLabel = element[0].querySelectorAll('.aaa.tx-note')
    txNote = element[0].querySelectorAll('.basic-grey.tx-note')

    expect(element.html().indexOf("label label label fun") == -1).toBe(true)
  )

  it "should show the note over the address label if the tx has both", ->
    addressLabel = element[0].querySelectorAll('.aaa.tx-note')
    txNote = element[0].querySelectorAll('.basic-grey.tx-note')
    expect(angular.element(addressLabel).hasClass('ng-hide')).toBe(true)

  it "should show the label if it is associated with an address in the tx and there is no tx note", inject((Wallet) ->
    spyOn(Wallet, "deleteNote")
    isoScope.deleteNote()
    isoScope.$digest()

    addressLabel = element[0].querySelectorAll('.aaa.tx-note')
    expect(angular.element(addressLabel).hasClass('ng-hide')).toBe(false)
  )

  it "should show a label when All wallets are filtered", inject((Wallet) ->
    $rootScope.account = '';
    spyOn(Wallet, "deleteNote")
    isoScope.deleteNote()
    element = $compile("<transaction-note transaction='transaction' account='account'></transaction-note>")($rootScope)
    $rootScope.$digest()

    addressLabel = element[0].querySelectorAll('.aaa.tx-note')
    expect(angular.element(addressLabel).hasClass('ng-hide')).toBe(false)
  )

  it "should save a modified note", inject((Wallet) ->
    spyOn(Wallet, "setNote")
    isoScope.transaction.note = "Modified note"
    isoScope.$digest()
    expect(Wallet.setNote).toHaveBeenCalled()
  )

  it "should not save an unmodified note", inject((Wallet) ->
    spyOn(Wallet, "setNote")
    isoScope.$digest()
    expect(Wallet.setNote).not.toHaveBeenCalled()
  )

  it "should create a new note", inject((Wallet) ->
    isoScope.transaction.note = null

    spyOn(Wallet, "setNote")

    isoScope.transaction.note = "New note"
    isoScope.$digest()

    expect(Wallet.setNote).toHaveBeenCalled()
  )

  it "should delete a note", inject((Wallet) ->
    isoScope.transaction.note = null

    spyOn(Wallet, "deleteNote")

    isoScope.$digest()

    expect(Wallet.deleteNote).toHaveBeenCalled()
  )


  it "should delete a note if it's an empty string", inject((Wallet) ->
    isoScope.transaction.note = ""

    spyOn(Wallet, "deleteNote")

    isoScope.$digest()

    expect(Wallet.deleteNote).toHaveBeenCalled()
  )

  it "does cancel edit note", ->
    isoScope.cancelEditNote()
    expect(isoScope.transaction.draftNote).toBe("")
    expect(isoScope.editNote).toBe(false)
    return

  it "does start edit note", ->
    isoScope.startEditNote()
    expect(isoScope.transaction.draftNote).toBe(isoScope.transaction.note)
    expect(isoScope.editNote).toBe(true)
    return

  it "does save note", ->
    isoScope.saveNote()
    expect(isoScope.transaction.draftNote).toBe(isoScope.transaction.note)
    expect(isoScope.editNote).toBe(false)
    return

  it "does delete note", ->
    isoScope.deleteNote()
    expect(isoScope.transaction.note).toBe(null)
    expect(isoScope.editNote).toBe(false)
    return

  return
