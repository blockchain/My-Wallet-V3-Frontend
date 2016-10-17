describe "TopCtrl", ->
  scope = undefined

  Wallet = undefined

  modal =
    open: ->

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller) ->
      Wallet = $injector.get("Wallet")
      MyWallet = $injector.get("MyWallet")

      Wallet.status = {isLoggedIn: true}

      scope = $rootScope.$new()

      MyWallet.wallet = {
        isUpgradedToHD: true
        keys: [
          { address: '1asdf', archived: false }, { address: '1asdf', archived: true }
        ]
      }

      $controller "TopCtrl",
        $scope: scope,
        $stateParams: {},
        $uibModal: modal

      return

    return

  it "should have access to login status",  inject(() ->
    expect(scope.status.isLoggedIn).toBe(true)
  )

  it "should have access to total balance",  inject((Wallet) ->
    Wallet.total = () -> 1
    expect(scope.getTotal()).toBe(1)
  )

  it "should show Fiat if USD is set as display currency", inject((Wallet) ->
    Wallet.settings.displayCurrency = {code: 'USD'}
    expect(scope.isBitCurrency(scope.settings.displayCurrency)).toBe(false)
  )

  it "should not show Fiat if BTC is set as display currency", inject((Wallet) ->
    Wallet.settings.displayCurrency = {code: 'BTC'}
    expect(scope.isBitCurrency(scope.settings.displayCurrency)).toBe(true)
  )
