describe "TransactionsCtrl", ->
  scope = undefined

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller, $q) ->
      Wallet = $injector.get("Wallet")
      MyWallet = $injector.get("MyWallet")
      smartAccount = $injector.get("smartAccount")

      MyWallet.wallet =
        hdwallet:
          accounts: [
            { label: "Checking", index: 0, archived: false, balance: 100 }
            { label: "Savings", index: 1, archived: false, balance: 175 }
            { label: "Spending", index: 2, archived: false, balance: 0 }
            { label: "Partay", index: 3, archived: true, balance: 50 }
          ]
          defaultAccount: { label: "Checking", index: 0, archived: false, balance: 100 }
          defaultAccountIndex: 0
        txList:
          subscribe: () -> (() -> )
          transactions: () ->
            [{ result: 1, txType: 'received', processedInputs: [{'address': '123'}], processedOutputs: [{'address': '456'}]}]
        fetchTransactions: () ->
          $q.resolve(1)

      Wallet.status =
        isLoggedIn: true
        didLoadBalances: true

      Wallet.legacyAddresses = () -> ['1A2B3C']
      Wallet.accounts = () -> MyWallet.wallet.hdwallet.accounts

      window.innerWidth = 415

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

    describe "filterByType", ->

      it "should filter by sent", ->
        tx = {}
        tx.txType = 'sent'
        scope.filterBy.type = 'SENT'

        result = scope.filterByType(tx)
        expect(result).toBe(true)

      it "should filter by received", ->
        tx = {}
        tx.txType = 'received'
        scope.filterBy.type = 'RECEIVED'

        result = scope.filterByType(tx)
        expect(result).toBe(true)

      it "should filter by transferred", ->
        tx = {}
        tx.txType = 'transfer'
        scope.filterBy.type = 'TRANSFERRED'

        result = scope.filterByType(tx)
        expect(result).toBe(true)

    describe "checkLabelDiff", ->

      it "should return the address when the label is the same as the address", ->
        label = 'abc'
        address = 'abc'
        result = scope.checkLabelDiff(label, address)
        expect(result).toBe('abc')

      it "should return a concatenate combination when the label is different from the address", ->
        label = 'abc'
        address = 'bcd'
        result = scope.checkLabelDiff(label, address)
        expect(result).toBe('abc, bcd')

    describe "filterByAddress", ->

      it "should return all transactions associated with an address", ->
        txs = scope.filterByAddress({address:'123'})
        expect(txs).toEqual([{ result: 1, txType: 'received', processedInputs: [{'address': '123'}], processedOutputs: [{'address': '456'}]}])

    describe "filter options on mobile", ->

      it "should read all transactions if on mobile", ->
        expect(scope.filterTypes[0]).toEqual('ALL_TRANSACTIONS')
