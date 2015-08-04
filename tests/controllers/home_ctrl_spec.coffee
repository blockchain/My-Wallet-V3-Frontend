describe "HomeCtrl", ->
  scope = undefined

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
          ]

      Wallet.status =
        isLoggedIn: true
        didLoadBalances: true

      scope = $rootScope.$new()

      $controller "HomeCtrl",
        $scope: scope,
        $modal: modal

      return

    return

  describe "on load", ->

    it "should have access to wallet accounts", ->
      expect(scope.accounts().length).toEqual(2)

    it "should have access to wallet status", ->
      expect(scope.status).toBeDefined()

    it "should have access to wallet transactions", ->
      expect(scope.transactions).toBeDefined()

  describe "account functions", ->

    it "should get account labels", ->
      expect(scope.accountLabels()).toEqual(['Checking', 'Savings'])

    it "should get account balances", ->
      expect(scope.accountBalances()).toEqual([100, 175])

  describe "newAccount()", ->

    it "should open the new account modal", ->
      spyOn(modal, 'open')
      scope.newAccount()
      expect(modal.open).toHaveBeenCalledWith(
        templateUrl: 'partials/account-form.jade'
        controller: 'AccountFormCtrl'
        resolve: jasmine.any(Object)
        windowClass: 'bc-modal'
      )
