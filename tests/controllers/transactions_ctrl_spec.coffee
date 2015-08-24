describe "TransactionsCtrl", ->
  scope = undefined

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller) ->
      Wallet = $injector.get("Wallet")
      MyWallet = $injector.get("MyWallet")

      MyWallet.wallet =
        hdwallet:
          accounts: [
            { label: "Checking", index: 0, archived: false, balance: 100 }
            { label: "Savings", index: 1, archived: false, balance: 175 }
            { label: "Spending", index: 2, archived: false, balance: 0 }
            { label: "Partay", index: 3, archived: true, balance: 50 }
          ]

      Wallet.status =
        isLoggedIn: true
        didLoadBalances: true

      scope = $rootScope.$new()

      $controller "TransactionsCtrl",
        $scope: scope,

      scope.selectedAcountIndex = 1

      return

    return

  describe "the transctions controller", ->

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

    it "should receive a new transaction from mock after 3 seconds on account 1",  ->
      pending() # Not sure how to test this with stateParams

    it "should fetch more transcations when a new account is selected", ->
      spyOn(scope, "nextPage")
      scope.selectedAcountIndex = 2
      scope.$digest()
      expect(scope.nextPage).toHaveBeenCalled()

    it "should have 4 transaction types", ->
      expect(scope.filterTypes.length).toEqual(4)

    it "can filter by transaction type", ->
      spyOn(scope, "setFilterType")
      scope.setFilterType(3)
      expect(scope.setFilterType).toHaveBeenCalled()

    it "can filter by search", ->
      spyOn(scope, "filterSearch")
      scope.filterSearch(1, "test")
      expect(scope.filterSearch).toHaveBeenCalled()

    it "can toggle a transaction's details", ->
      spyOn(scope, "toggleTransaction")
      scope.toggleTransaction(scope.transactions[0])
      expect(scope.toggleTransaction).toHaveBeenCalled()
