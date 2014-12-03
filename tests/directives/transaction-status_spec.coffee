describe "Transaction Status Directive", ->
  $compile = undefined
  $rootScope = undefined
  element = undefined
  isoScope = undefined
  
  # Load the myApp module, which contains the directive
  beforeEach module("walletApp")
  beforeEach(module('templates/transaction-status.html'))
  
  beforeEach inject((_$compile_, _$rootScope_) ->
    
    $compile = _$compile_
    $rootScope = _$rootScope_
    
    $rootScope.transaction = {confirmations: 2}
    
    return
  )
  
  beforeEach ->
    element = $compile("<transaction-status transaction='transaction'></transaction-status>")($rootScope)
    $rootScope.$digest()
    isoScope = element.isolateScope()
  
  it "should say 'Pending' if there are < 3 confirmations", ->
    expect(element.html()).toContain "translate=\"PENDING"      
  
  it "should show minutes remaining if there are < 3 confirmations", ->
    expect(element.html()).toContain "TRANSACTION_WILL_COMPLETE_IN"      
    expect(element.html()).toContain "minutesRemaining"
    expect(isoScope.minutesRemaining).toBe(10)      
  
  it "should show there's 30 minutes remaining if there are 0 confirmations", ->
    isoScope.transaction.confirmations = 0
    isoScope.$digest()
    expect(element.html()).toContain "TRANSACTION_WILL_COMPLETE_IN"      
    expect(isoScope.minutesRemaining).toBe(30)      

  it "should say 'Complete' if there are >= 3 confirmations", ->
    isoScope.transaction.confirmations = 3
    isoScope.$digest()
    expect(element.html()).toContain "translate=\"COMPLETE"   
    expect(element.html()).not.toContain "TRANSACTION_WILL_COMPLETE_IN"      
       