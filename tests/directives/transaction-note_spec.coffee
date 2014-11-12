describe "Transaction Note Directive", ->
  $compile = undefined
  $rootScope = undefined
  
  # Load the myApp module, which contains the directive
  beforeEach module("walletApp")
  beforeEach(module('templates/transaction-note.html'))
  
  # Store references to $rootScope and $compile
  # so they are available to all tests in this describe block
  beforeEach inject((_$compile_, _$rootScope_) ->
    
    # The injector unwraps the underscores (_) from around the parameter names when matching
    $compile = _$compile_
    $rootScope = _$rootScope_
    
    $rootScope.transaction = {note: "Hello World"}
    
    return
  )
  
  it "Replaces the element with the appropriate content", ->
    
    element = $compile("<transaction-note transaction='transaction'></transaction-note>")($rootScope)
    
    $rootScope.$digest()
        
    expect(element.html()).toContain "Hello World"
    
    isoScope = element.isolateScope()
    
    expect(isoScope.transaction.note).toBe("Hello World")
    
    return

  return