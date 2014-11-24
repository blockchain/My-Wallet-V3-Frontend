describe "Transaction Note Directive", ->
  $compile = undefined
  $rootScope = undefined
  element = undefined
  isoScope = undefined
  wallet = undefined
  html = undefined
  
  beforeEach module("walletApp")
  beforeEach(module('templates/transaction-description.html'))
  
  beforeEach inject((_$compile_, _$rootScope_, $injector) ->
    
    
    # The injector unwraps the underscores (_) from around the parameter names when matching
    $compile = _$compile_
    $rootScope = _$rootScope_
    
    
    Wallet = $injector.get("Wallet")
    Wallet.login("test", "test")  
    
    $rootScope.transaction = {hash: "tx_hash", from_addresses: [], to_addresses: [], from_account: 0, to_account: 1, intraWallet: null}
    
    return
  )
  
  beforeEach ->
    html = "<transaction-description transaction='transaction'></transaction-description>"
    element = $compile(html)($rootScope)
    $rootScope.$digest()
    isoScope = element.isolateScope()
  
  it "should say You", ->
    expect(element.html()).toContain '<b translate="YOU"></b>'
        
  it "should have the transaction in its scope", ->
    expect(isoScope.transaction.hash).toBe("tx_hash")
    
  it "should recognize an intra wallet transaction", ->
    isoScope.transaction.intraWallet = true
    
    element = $compile(html)($rootScope)
    $rootScope.$digest()
    
    expect(element.html()).toContain 'translate="MOVED_BITCOIN_TO"'

  return
  
    