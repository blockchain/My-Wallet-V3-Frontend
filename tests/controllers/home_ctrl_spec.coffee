describe "HomeCtrl", ->
  scope = undefined

  Wallet = undefined

  modal =
    open: ->

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
        keys: [
          { label: 'Imported', archived: false, balance: 10 }
        ]

      Wallet.status =
        isLoggedIn: true
        didLoadBalances: true

      Wallet.total = () -> 1

      scope = $rootScope.$new()

      $controller "HomeCtrl",
        $scope: scope,
        $uibModal: modal

      return

    return

  describe "on load", ->

    it "should have access to wallet accounts", ->
      expect(scope.activeAccounts().length).toBeGreaterThan(0)

  describe "getTotal()", ->
    it "should return total", ->
      expect(scope.getTotal()).toEqual(1)

  describe "hasLegacyAddresses()", ->
    it "should be true if there are legacy addresses", ->
      expect(scope.hasLegacyAddresses()).toBe(true)

    it "should be null if not logged in", ->
      Wallet.status.isLoggedIn = false
      expect(scope.hasLegacyAddresses()).toBe(null)
