describe "TransactionCtrl", ->
  scope = undefined

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller) ->
      Wallet = $injector.get("Wallet")
      MyWallet = $injector.get("MyWallet")

      Wallet.login("test", "test")

      scope = $rootScope.$new()

      $controller "TransactionCtrl",
        $scope: scope,
        $stateParams: {hash: "aaaa"}

      scope.$digest()

      return

    return

  it "should have access to transactions",  inject(() ->
    expect(scope.transactions).toBeDefined()
  )

  it "should have access to accounts",  inject(() ->
    expect(scope.accounts).toBeDefined()
  )

  it "should have access to address book",  inject(() ->
    expect(scope.addressBook).toBeDefined()
  )

  it "should show the correct transaction", ->
    expect(scope.transaction.hash).toBe("aaaa")

  describe "from", ->
    it "should show the from address", ->
      expect(scope.from).toBe("1D2YzLr5qvrwMSm8onYbns5BLJ9jwzPHcQ")

    it "should recognize a labelled wallet address", ->
      scope.transaction =
        hash: "123"
        from:
          account: null
          legacyAddresses: [{address: "some_legacy_address"}]

        to:
          account: null
          legacyAddresses: []
          external:
            addressWithLargestOutput: "abc"


      scope.$digest()

      expect(scope.from).toContain("Old")

    it "should add 'you' to an unlabelled wallet address", ->
      scope.transaction =
        hash: "123"
        from:
          account: null
          legacyAddresses: [{address: "some_legacy_address_without_label"}]

        to:
          account: null
          legacyAddresses: []
          external:
            addressWithLargestOutput: "abc"

      scope.$digest()

      expect(scope.from).toContain("you")

    it "should show the account", inject((Wallet) ->
      scope.transaction =
        hash: "123"
        from:
          account:
            index: 0
          legacyAddresses: []
        to:
          account: null
          legacyAddresses: []
          external:
            addressWithLargestOutput: "abc"

      scope.$digest()

      expect(scope.from).toBe("Savings")
    )

  describe "to", ->
    it "should recognize a labelled wallet address", ->
      scope.transaction =
        hash: "123"
        from:
          account: null
          legacyAddresses: []
          external:
            addressWithLargestOutput: "abc"
        to:
          account: null
          legacyAddresses: [{address: "some_legacy_address"}]

      scope.$digest()

      expect(scope.to).toContain("Old")

    it "should add 'you' to an unlabelled wallet address", ->
      scope.transaction =
        hash: "123"
        from:
          account: null
          legacyAddresses: []
          external:
            addressWithLargestOutput: "abc"
        to:
          account: null
          legacyAddresses: [{address: "some_legacy_address_without_label"}]


      scope.$digest()

      expect(scope.to).toContain("you")

    it "should create a multiline with both 'to' addresses and each amount", ->
      scope.transaction =
        hash: "123"
        from:
          account: null
          legacyAddresses: []
          external:
            addressWithLargestOutput: "abc"
        to:
          account: null
          externalAddresses: [
            {address: "external address 1", amount: 50000},
            {address: "external address 2", amount: 70000}
          ]
      scope.$digest()
      expect(scope.to).toContain("0.0005 BTC")
      expect(scope.to).toContain("0.0007 BTC")
      expect(scope.to).toContain("br")
      expect(scope.to).toContain("address 1")
      expect(scope.to).toContain("address 2")

    it "should show the account", inject((Wallet) ->
      scope.transaction =
        hash: "123"
        from:
          account: null
          legacyAddresses: []
          external:
            addressWithLargestOutput: "abc"
        to:
          account:
            index: 0
          legacyAddresses: []

      scope.$digest()

      expect(scope.to).toBe("Savings")
    )
