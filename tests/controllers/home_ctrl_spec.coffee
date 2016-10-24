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

  describe "activeAccounts()", ->
    it "should know the number", inject((Wallet) ->
      expect(scope.activeAccounts().length).toBeGreaterThan(0)
    )

    it "should be null when not logged in", inject((Wallet), ->
      Wallet.status.isLoggedIn = false
      expect(scope.activeAccounts()).toBe(null)
    )

  describe "activeLegacyAddresses()", ->
    it "should know the number", inject((Wallet) ->
      expect(scope.activeLegacyAddresses().length).toBeGreaterThan(0)
    )

    it "should be null when not logged in", inject((Wallet), ->
      Wallet.status.isLoggedIn = false
      expect(scope.activeLegacyAddresses()).toBe(null)
    )

  describe "getTotal()", ->
    it "should return total", ->
      expect(scope.getTotal()).toEqual(1)
