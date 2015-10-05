describe "Transaction Description Directive", ->
  $compile = undefined
  $rootScope = undefined
  element = undefined
  isoScope = undefined
  Wallet = undefined
  html = undefined

  beforeEach module("walletApp")

  beforeEach inject((_$compile_, _$rootScope_, $injector) ->


    # The injector unwraps the underscores (_) from around the parameter names when matching
    $compile = _$compile_
    $rootScope = _$rootScope_


    Wallet = $injector.get("Wallet")

    Wallet.my =
      wallet:
        getAddressBookLabel: () -> null

    Wallet.accounts = () -> [{index: 0, label: "Savings"}, { index: 1, label: "Spending"}]

    $rootScope.transaction = {
            hash: "tx_hash",
            confirmations: 13,
            intraWallet: null,
            txTime: 1441400781,
            from: {account: {index: 0, amount: 300000000}, legacyAddresses: null, externalAddresses: null},
            to: {accounts: [{index: 1, amount: 300000000}], legacyAddresses: null, externalAddresses: null}
          }

    return
  )

  beforeEach ->
    html = "<transaction-description transaction='transaction'></transaction-description>"
    element = $compile(html)($rootScope)
    $rootScope.$digest()
    isoScope = element.isolateScope()

  it "should include incoming_tx class", ->
    expect(element.html()).toContain 'incoming_tx'

  it "should have the transaction in its scope", ->
    expect(isoScope.transaction.hash).toBe("tx_hash")

  it "should recognize an intra wallet transaction", ->
    isoScope.transaction.intraWallet = true

    element = $compile(html)($rootScope)
    $rootScope.$digest()

    expect(element.html()).toContain 'translate="MOVED_BITCOIN_TO"'

  it "should determine the other address for inter wallet transactions", ->
    $rootScope.transaction.intraWallet = true

    element = $compile(html)($rootScope)
    $rootScope.$digest()
    isoScope = element.isolateScope()

    expect(isoScope.other_address).toBe("Savings")

  it "should determine the other address for received transactions", ->
    expect(isoScope.other_address).toBe("Spending")

  it "should recognize sending from imported address", ->
    isoScope.transaction.to.accounts = []
    isoScope.transaction.from.account = null
    isoScope.transaction.from.legacyAddresses = {addressWithLargestOutput: "some_legacy_address", amount: 100000000}
    isoScope.transaction.to.externalAddresses = [{address: "1abcd", amount: 100000000}]
    isoScope.transaction.result = -100000000

    element = $compile(html)($rootScope)
    $rootScope.$digest()

    expect(element.html()).not.toContain 'translate="MOVED_BITCOIN_TO"'
    expect(element.html()).toContain 'translate="SENT"'

  it "should recognize receiving to imported address", ->
   isoScope.transaction.to.accounts = []
   isoScope.transaction.from.account = null
   isoScope.transaction.to.legacyAddresses = {addressWithLargestOutput: "some_legacy_address", amount: 100000000}
   isoScope.transaction.from.externalAddresses = {addressWithLargestOutput: "1abcd", amount: 100000000}
   isoScope.transaction.result = 100000000


   element = $compile(html)($rootScope)
   $rootScope.$digest()

   expect(element.html()).not.toContain 'translate="MOVED_BITCOIN_TO"'
   expect(element.html()).toContain 'translate="RECEIVED_BITCOIN_FROM"'

  describe "send to email", ->
    beforeEach ->
      isoScope.transaction.to.accounts = []
      isoScope.transaction.to.email = {"email":"somebody@blockchain.com"}
      isoScope.result = -100000000

      element = $compile(html)($rootScope)
      $rootScope.$digest()

    it "should be known", ->
      pending()
      expect(isoScope.address).toEqual("somebody@blockchain.com")

    it "should be shown", ->
      pending()
      expect(element.html()).toContain 'somebody@blockchain.com'

    it "should show if not redeemed", ->
      pending()
      expect(element.html()).toContain 'translate="NOT_REDEEMED_YET"'

    it "should show redeemed date", ->
      pending()

      # MyWallet.paidTo.redeemedAt = 1416832288

      element = $compile(html)($rootScope)
      $rootScope.$digest()

      expect(element.html()).toContain 'translate="REDEEMED_AT"'
      expect(element.html()).toContain '2014'

  describe "send to mobile", ->
    it "pending...", ->
      pending()
