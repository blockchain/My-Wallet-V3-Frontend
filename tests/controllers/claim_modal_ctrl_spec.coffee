describe "ClaimModalCtrl", ->

  scope = undefined
  modalInstance =
    close: ->
    dismiss: ->

  askForSecondPassword = undefined

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, localStorageService, $rootScope, $controller, $q) ->
      localStorageService.remove("mockWallets")

      Wallet = $injector.get("Wallet")
      MyWallet = $injector.get("MyWallet")

      MyWallet.wallet = {
        isUpgradedToHD: true
        hdwallet: {
          defaultAccountIndex: 0
          accounts: [{ index: 0, archived: false }]
        }
      }

      scope = $rootScope.$new()

      balancePromise = {
        then: (r)->
          r(100000)
      }

      $controller "ClaimModalCtrl",
        $scope: scope,
        $stateParams: {},
        $modalInstance: modalInstance
        claim: {code: "abcd", balance: balancePromise}

      scope.$digest()

      scope.payment = {
        from: (addr) -> {
          to: (dest) -> {
            sweep: () -> {
              build: () -> {
                sign: () -> {
                  publish: () -> {
                  }
                }
              }
            }
          }
        }
      }

      askForSecondPassword = $q.defer()
      Wallet.askForSecondPasswordIfNeeded = () ->
        askForSecondPassword.promise

      askForSecondPassword.resolve()

      return

    return

  it "should list accounts", ->
    expect(scope.accounts().length).toBeGreaterThan(0)

  it "should fetch the redeem balance", ->
    expect(scope.balance).toBe(100000)

  it "should let the user redeem", inject((Wallet)->
    spyOn(scope.payment, "from").and.callThrough()
    scope.redeem()
    scope.$digest()
    expect(scope.payment.from).toHaveBeenCalledWith("abcd")
  )
