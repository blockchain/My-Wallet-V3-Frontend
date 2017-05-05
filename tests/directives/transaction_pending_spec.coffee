describe "Transaction Pending Directive", ->
  $compile = undefined
  $rootScope = undefined
  element = undefined
  isoScope = undefined

  beforeEach module('walletDirectives')
  
  beforeEach module("walletApp")

  beforeEach inject((_$compile_, _$rootScope_, $injector) ->

    # The injector unwraps the underscores (_) from around the parameter names when matching
    $compile = _$compile_
    $rootScope = _$rootScope_

    $rootScope.transaction = {
      hash: "tx_hash",
      confirmations: 1,
      txType: 'sent'
    }

    return
  )

  beforeEach ->
    html = "<transaction-pending transaction='transaction'></transaction-pending>"
    element = $compile(html)($rootScope)
    $rootScope.$digest()
    isoScope = element.isolateScope()

  describe 'label for pending tx', ->

    it "should display if < 3 confirmations", ->
      expect(isoScope.complete).toBe(false)

    it "should assign the sent message to the tooltip", ->
      isoScope.pendingMessage($rootScope.transaction)
      expect(isoScope.message).toBe('PENDING_TX_SENDER')

    it "should not display if confirmations >= 3", ->
      isoScope.transaction.confirmations = 3
      html = "<transaction-pending transaction='transaction'></transaction-pending>"
      element = $compile(html)($rootScope)
      $rootScope.$digest()
      isoScope = element.isolateScope()
      expect(isoScope.complete).toBe(true)
