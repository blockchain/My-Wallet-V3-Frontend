describe "Activity Feed directive", ->
  $compile = undefined
  $rootScope = undefined
  element = undefined
  scope = undefined

  beforeEach inject((_$compile_, _$rootScope_, $injector) ->
    $compile = _$compile_
    $rootScope = _$rootScope_
    scope = $rootScope.$new()

    Wallet = $injector.get("Wallet")
    Activity = $injector.get("Activity")
    MyWallet = $injector.get("MyWallet")

    MyWallet.wallet = {
      hdwallet: {
        accounts: [{ archived: false }, { archived: false }, { archived: true }]
      }
      status: {didLoadTransactions: false}
    }

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
    pending()
    scope.status.didLoadTransactions = true
    scope.$apply()
    expect(scope.loading).toBe(false)
