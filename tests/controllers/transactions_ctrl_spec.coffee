describe "TransactionsCtrl", ->
  scope = undefined

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller) ->
      Wallet = $injector.get("Wallet")

      scope = $rootScope.$new()

      $controller "TransactionsCtrl",
        $scope: scope,
        $stateParams: {}

      scope.transactions = Wallet.transactions

      return

    return

  it "should have access to address book",  inject(() ->
    pending()
    expect(scope.addressBook).toBeDefined()
    expect(scope.addressBook["17gJCBiPBwY5x43DZMH3UJ7btHZs6oPAGq"]).toBe("John")
  )

  it "should be able to fetch more transactions", inject((Wallet) ->
    spyOn(Wallet, "fetchMoreTransactions")
    scope.nextPage()
    expect(Wallet.fetchMoreTransactions).toHaveBeenCalled()
  )

  it "should receive a new transaction from mock after 3 seconds on account 1",  inject((MyWallet, Wallet, $timeout) ->
    pending() # Not sure how to test this with stateParams
    # before = Wallet.transactions.length
    #
    # MyWallet.mockSpontanuousBehavior()
    # $timeout.flush()
    # expect(Wallet.transactions.length).toBe(before + 1)
  )

  it "should have 4 transaction types", inject(() ->
    expect(scope.filterTypes.length).toEqual(4)
  )

  it "can filter by transaction type", inject((Wallet) ->
    spyOn(scope, "setFilterType")
    scope.setFilterType(3)
    expect(scope.setFilterType).toHaveBeenCalled()
  )

  it "can filter by search", inject((Wallet) ->
    spyOn(scope, "filterSearch")
    scope.filterSearch(1, "test")
    expect(scope.filterSearch).toHaveBeenCalled()
  )
