describe "ClaimModalCtrl", ->

  scope = undefined
  modalInstance =
    close: ->
    dismiss: ->

  askForSecondPassword = undefined

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller, $q) ->
      Wallet = $injector.get("Wallet")
      MyWallet = $injector.get("MyWallet")
      MyWalletPayment = $injector.get("MyWalletPayment")

      MyWallet.wallet = {
        isUpgradedToHD: true
        hdwallet: {
          defaultAccountIndex: 0
          accounts: [{ index: 0, archived: false }]
        }
      }

      Wallet.Payment = MyWalletPayment
      Wallet.status.isLoggedIn = true

      scope = $rootScope.$new()

      balancePromise = {
        then: (r)->
          r(100000)
      }

      $controller "ClaimModalCtrl",
        $scope: scope,
        $stateParams: {},
        $uibModalInstance: modalInstance
        claim: {code: "abcd", balance: balancePromise}

      scope.$digest()

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
