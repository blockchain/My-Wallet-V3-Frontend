describe "Transaction Description Directive", ->
  $compile = undefined
  $rootScope = undefined
  element = undefined
  isoScope = undefined
  Wallet = undefined
  html = undefined

  beforeEach module("walletApp")

  beforeEach inject((_$compile_, _$rootScope_, $injector) ->


    # The injector unwraps the underscores (_) from around the parameter names when matching
    $compile = _$compile_
    $rootScope = _$rootScope_


    Wallet = $injector.get("Wallet")

    Wallet.my =
      wallet:
        getAddressBookLabel: () -> null

    Wallet.accounts = () -> [{index: 0, label: "Savings"}, { index: 1, label: "Spending"}]

    $rootScope.transaction = {
      hash: "tx_hash",
      confirmations: 13,
      txType: 'send',
      time: 1441400781,
      processedInputs: [{ change: false, address: 'Savings' }],
      processedOutputs: [{ change: false, address: 'Spending' }, { change: true, address: '1asdf' }]
    }

    return
  )

  beforeEach ->
    html = "<transaction-description transaction='transaction'></transaction-description>"
    element = $compile(html)($rootScope)
    $rootScope.$digest()
    isoScope = element.isolateScope()

  it "should include incoming_tx class", ->
    expect(element.html()).toContain 'incoming_tx'

  it "should have the transaction in its scope", ->
    expect(isoScope.tx.hash).toBe("tx_hash")

  it "should recognize an intra wallet transaction", ->
    isoScope.tx.txType = 'transfer'

    element = $compile(html)($rootScope)
    $rootScope.$digest()

    expect(element.html()).toContain 'translate="MOVED_BITCOIN_TO"'

  it "should determine the other address for inter wallet transactions", ->
    isoScope.tx.txType = 'transfer'

    element = $compile(html)($rootScope)
    $rootScope.$digest()
    isoScope = element.isolateScope()

    expect(isoScope.primaryLabel).toBe("Savings")

  it "should determine the other address for received transactions", ->
    expect(isoScope.secondaryLabel).toBe("Spending")

  it "should recognize sending from imported address", ->
    isoScope.tx.txType = 'sent'
    isoScope.tx.result = -100000000

    element = $compile(html)($rootScope)
    $rootScope.$digest()

    expect(element.html()).not.toContain 'translate="MOVED_BITCOIN_TO"'
    expect(element.html()).toContain 'translate="SENT"'

  it "should recognize receiving to imported address", ->
    isoScope.tx.txType = 'received'
    isoScope.tx.result = 100000000

    element = $compile(html)($rootScope)
    $rootScope.$digest()

    expect(element.html()).not.toContain 'translate="MOVED_BITCOIN_TO"'
    expect(element.html()).toContain 'translate="RECEIVED_BITCOIN_FROM"'
