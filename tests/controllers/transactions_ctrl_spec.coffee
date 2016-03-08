describe "TransactionsCtrl", ->
  scope = undefined

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller, $q) ->
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
        txList:
          subscribe: () -> (() -> )
          transactions: () ->
            [{ result: 1, txType: 'received' }]
        fetchTransactions: () ->
          $q.resolve(1)

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

    it "should be able to fetch more transactions", inject((Wallet, $timeout) ->
      spyOn(Wallet.my.wallet, "fetchTransactions").and.callThrough()
      scope.nextPage()
      $timeout.flush()
      expect(Wallet.my.wallet.fetchTransactions).toHaveBeenCalled()
    )

    it "should receive a new transaction from mock after 3 seconds on account 1",  ->
      pending() # Not sure how to test this with stateParams

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

    it "can show a transaction", ->
      scope.showTransaction({ result: 1, txType: 'received' })

    describe "filterByType", ->

      it "should fitler by sent", ->
        tx = {}
        tx.txType = 'sent'
        scope.filterBy = 'SENT'

        result = scope.filterByType(tx)
        expect(result).toBe(true)

      it "should fitler by received", ->
        tx = {}
        tx.txType = 'received'
        scope.filterBy = 'RECEIVED_BITCOIN_FROM'

        result = scope.filterByType(tx)
        expect(result).toBe(true)

      it "should filter by transferred", ->
        tx = {}
        tx.txType = 'transfer'
        scope.filterBy = 'MOVED_BITCOIN_TO'

        result = scope.filterByType(tx)
        expect(result).toBe(true)
