describe "Transaction Warning Directive", ->
  $compile = undefined
  $rootScope = undefined
  element = undefined
  isoScope = undefined
  Wallet = undefined
  html = undefined

  beforeEach module('walletDirectives');
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
    html = "<transaction-warning transaction='transaction'></transaction-warning>"
    element = $compile(html)($rootScope)
    $rootScope.$digest()
    isoScope = element.isolateScope()

  it "should not show warnings for double spend txs", ->
    expect(element[0].outerHTML).toContain('ng-hide');
    isoScope.tx.double_spend = true;
    isoScope.tx.rbf = true;
    expect().not.toContain('ng-hide');
