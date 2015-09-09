describe "RevealXpubCtrl", ->
  Wallet = undefined
  scope = undefined
  accounts = [{label: 'Savings', extendedPublicKey: "xpub0"}, {label: 'Party Money', xpub: "xpub1"}]

  modalInstance =
    close: ->
    dismiss: ->

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector) ->
      Wallet = $injector.get("Wallet")
      MyWallet = $injector.get("MyWallet")

      Wallet.accounts = () -> accounts

      Wallet.askForSecondPasswordIfNeeded = () ->
        return {
          then: (fn) -> fn(); return { catch: (-> ) }
        }

      MyWallet.getHistoryAndParseMultiAddressJSON = (-> )

      MyWallet.wallet = {
        isDoubleEncrypted: false

      }

  beforeEach ->
    angular.mock.inject ($rootScope, $controller, $compile) ->
      scope = $rootScope.$new()

      $controller "RevealXpubCtrl",
        $scope: scope
        $stateParams: {}
        $modalInstance: modalInstance
        account: Wallet.accounts()[0]

      return
    return

  beforeEach -> accounts.splice(2); accounts[0].label = 'Savings'

  it "should show xpub", ->
    expect(scope.xpub).toBe("xpub0")
