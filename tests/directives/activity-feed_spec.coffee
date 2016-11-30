describe "Activity Feed directive", ->
  $compile = undefined
  $rootScope = undefined
  element = undefined
  scope = undefined

  beforeEach module("walletApp")

  beforeEach inject((_$compile_, _$rootScope_, $injector) ->
    $compile = _$compile_
    $rootScope = _$rootScope_
    $httpBackend = $injector.get("$httpBackend")
    scope = $rootScope.$new()

    Wallet = $injector.get("Wallet")
    MyWallet = $injector.get("MyWallet")

    $httpBackend.whenGET("/Resources/wallet-options.json").respond();

    MyWallet.wallet = {
      hdwallet:
        accounts: [{ archived: false }, { archived: false }, { archived: true }]
      status: {didLoadTransactions: false}
      txList:
        subscribe: () -> (() ->)
    }

    Activity = $injector.get("Activity")
    Activity.activity  = { activities: [], transactions: [], logs: [], limit: 8 }

    return
  )

  beforeEach ->
    element = $compile("<div><activity-feed></activity-feed></div>")($rootScope)
    $rootScope.$digest()
    scope.$apply()

  it "has an initial loading state of true", ->
    expect(scope.loading).toBe(true)

  it "has no loading state once transactions have loaded", ->
    # need to stub out the Activity service
    scope.status.didLoadTransactions = true
    scope.$apply()
    expect(scope.loading).toBe(false)
