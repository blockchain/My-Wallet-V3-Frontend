describe "Transaction Note Directive", ->
  $compile = undefined
  $rootScope = undefined
  element = undefined
  isoScope = undefined
  Wallet = undefined
  MyWallet = undefined
  html = undefined
  
  beforeEach module("walletApp")
  beforeEach(module('templates/transaction-description.html'))
  
  beforeEach inject((_$compile_, _$rootScope_, $injector) ->
    
    
    # The injector unwraps the underscores (_) from around the parameter names when matching
    $compile = _$compile_
    $rootScope = _$rootScope_
    
    
    Wallet = $injector.get("Wallet")
    Wallet.login("test", "test")  
    
    MyWallet = $injector.get("MyWallet")
    
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

  describe "send to email", ->
    beforeEach ->
      isoScope.transaction.to_account = null
      isoScope.transaction.to_addresses.push "temp_address"
      
      MyWallet.paidTo = {"tx_hash": {"email":"somebody@blockchain.com","mobile":null,"redeemedAt":null,"address":"temp_address"}}
      
      element = $compile(html)($rootScope)
      $rootScope.$digest()
      
    it "should be shown", ->
      pending()
      
      expect(element.html()).toContain 'somebody@blockchain.com'
    
    it "should show if not redeemed", -> 
      pending()
     
      expect(element.html()).toContain 'translate="NOT_REDEEMED_YET"'
    
    it "should show redeemed date", ->  
      pending()
    
      MyWallet.paidTo.redeemedAt = 1416832288
      
      element = $compile(html)($rootScope)
      $rootScope.$digest()
      
      expect(element.html()).toContain 'translate="REDEEMED_AT"'
      expect(element.html()).toContain '2014'

  describe "send to mobile", ->
    it "pending...", ->
      pending()
  
  return
  
    