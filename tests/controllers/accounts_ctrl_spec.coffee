describe "WalletNavigationCtrl", ->
  scope = undefined

  Wallet = undefined

  modal =
    open: ->

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller) ->
      Wallet = $injector.get("Wallet")
      MyWallet = $injector.get("MyWallet")

      MyWallet.wallet = {
        balanceSpendableActiveLegacy: 100000000
        keys: [{ archived: false }, { archived: true }]
        hdwallet: {
          accounts: [{ archived: false }, { archived: false }, { archived: true }]
        }
        accountInfo: { invited: false, countryCodeGuess: "US" }
      }

      Wallet.status.isLoggedIn = true

      scope = $rootScope.$new()

      $controller "WalletNavigationCtrl",
        $scope: scope,
        $stateParams: {}
        $uibModal: modal

      return

    return

  describe "numberOfActiveLegacyAddresses()", ->
    it "should know the number", inject((Wallet) ->
      expect(scope.numberOfActiveLegacyAddresses()).toBe(1)
    )

    it "should be null when not logged in", inject((Wallet), ->
      Wallet.status.isLoggedIn = false
      expect(scope.numberOfActiveLegacyAddresses()).toBe(null)
    )

  it "should know the number of active acounts", inject(() ->
    expect(scope.numberOfActiveAccounts()).toBe(2)
  )

  it "should show account based on state", inject(() ->
    expect(scope.showOrHide()).toBe(false)
  )

  describe "setIsCountryWhitelisted", ->
    it "should set isWhitelisted if guess is on whitelist", ->
      mockOptions = { showBuySellTab: ["US"] }
      scope.setIsCountryWhitelisted(mockOptions)
      expect(scope.isCountryWhitelisted).toBeTruthy()

    it "should not set isWhitelisted if guess is not on whitelist", ->
      mockOptions = { showBuySellTab: ["UK"] }
      scope.setIsCountryWhitelisted(mockOptions)
      expect(scope.isCountryWhitelisted).toBeFalsy()

    it "should set isWhitelisted if accountInfo is null", ->
      mockOptions = { showBuySellTab: ["UK"] }
      scope.accountInfo = null
      scope.setIsCountryWhitelisted(mockOptions)
      expect(scope.isCountryWhitelisted).toBeFalsy()
