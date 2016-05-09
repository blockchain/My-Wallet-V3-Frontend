describe "Transaction Status Directive", ->
  $compile = undefined
  $rootScope = undefined
  element = undefined
  isoScope = undefined

  # Load the myApp module, which contains the directive
  beforeEach module("walletApp")
  
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

  it "should show there's 30 minutes remaining if there are 0 confirmations", ->
    isoScope.transaction.confirmations = 0
    isoScope.$digest()
    expect(element.html()).toContain "TRANSACTION_WILL_COMPLETE_IN"
    expect(isoScope.minutesRemaining).toBe(30)

  it "should say 'Complete' if there are >= 3 confirmations", ->
    isoScope.transaction.confirmations = 3
    isoScope.$digest()
    expect(element.html()).toContain "translate=\"TRANSACTION_COMPLETE"
    expect(element.html()).not.toContain "TRANSACTION_WILL_COMPLETE_IN"


  it "should should warn about frugal fee if zero confirmations", ->
    isoScope.transaction.confirmations = 0
    isoScope.transaction.frugal = true
    isoScope.$digest()
    expect(isoScope.frugalWarning).toBe(true)
    expect(element.html()).toContain "TRANSACTION_FRUGAL"
    expect(element.html()).not.toContain "TRANSACTION_WILL_COMPLETE_IN"

  it "should should not warn about frugal fee if confirmed", ->
    isoScope.transaction.confirmations = 1
    isoScope.transaction.frugal = false
    isoScope.$digest()
    expect(isoScope.frugalWarning).toBe(false)
    expect(element.html()).not.toContain "translate=\"TRANSACTION_FRUGAL"
    expect(element.html()).toContain "TRANSACTION_WILL_COMPLETE_IN"
