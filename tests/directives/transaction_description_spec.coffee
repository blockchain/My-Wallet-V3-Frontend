describe "Transaction Description Directive", ->
  $compile = undefined
  $rootScope = undefined
  element = undefined
  isoScope = undefined
  Wallet = undefined
  MyWallet = undefined
  html = undefined

  beforeEach module("walletApp")
  beforeEach(module('templates/transaction-description.html'))

  beforeEach inject((_$compile_, _$rootScope_, $injector) ->


    # The injector unwraps the underscores (_) from around the parameter names when matching
    $compile = _$compile_
    $rootScope = _$rootScope_


    Wallet = $injector.get("Wallet")
    Wallet.login("test", "test")

    MyWallet = $injector.get("MyWallet")

    $rootScope.transaction = {
            hash: "tx_hash", confirmations: 13, intraWallet: null,
            from: {account: {index: 0, amount: 300000000}, legacyAddresses: null, externalAddresses: null},
            to: {account: {index: 1, amount: 300000000}, legacyAddresses: null, externalAddresses: null}
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

  it "should recognize sending from imported address", ->
    isoScope.transaction.to.account = null
    isoScope.transaction.from.account = null
    isoScope.transaction.from.legacyAddresses = {addressWithLargestOutput: "some_legacy_address", amount: 100000000}
    isoScope.transaction.to.externalAddresses = [{address: "1abcd", amount: 100000000}]
    isoScope.transaction.result = -100000000

    element = $compile(html)($rootScope)
    $rootScope.$digest()

    expect(element.html()).not.toContain 'translate="MOVED_BITCOIN_TO"'
    expect(element.html()).toContain 'translate="SENT_BITCOIN_TO"'

  it "should recognize receiving to imported address", ->
   isoScope.transaction.to.account = null
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
      isoScope.transaction.to_account = null
      isoScope.transaction.to_addresses.push "temp_address"

      MyWallet.paidTo = {"tx_hash": {"email":"somebody@blockchain.com","mobile":null,"redeemedAt":null,"address":"temp_address"}}

      element = $compile(html)($rootScope)
      $rootScope.$digest()

    it "should be shown", ->
      pending()

      expect(element.html()).toContain 'somebody@blockchain.com'

    it "should show if not redeemed", ->
      pending()

      expect(element.html()).toContain 'translate="NOT_REDEEMED_YET"'

    it "should show redeemed date", ->
      pending()

      MyWallet.paidTo.redeemedAt = 1416832288

      element = $compile(html)($rootScope)
      $rootScope.$digest()

      expect(element.html()).toContain 'translate="REDEEMED_AT"'
      expect(element.html()).toContain '2014'

  describe "send to mobile", ->
    it "pending...", ->
      pending()

  return


