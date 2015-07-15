describe "walletServices", () ->
  Wallet = undefined
  MyWallet = undefined

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, $q, localStorageService) ->
      localStorageService.remove("mockWallets")

      Wallet = $injector.get("Wallet")
      MyWallet = $injector.get("MyWallet")

      Wallet.askForSecondPasswordIfNeeded = () ->
        return {
          then: (fn) -> fn(); return { catch: (-> ) }
        }

      MyWallet.getHistoryAndParseMultiAddressJSON = (-> )

      MyWallet.wallet = {
        isDoubleEncrypted: false
        newAccount: (label) -> { label: label }
      }

      return
    return

  describe "createAccount()", ->

    it "should call generateNewKey()", inject((Wallet, MyWallet) ->
      spyOn(Wallet, "createAccount")
      Wallet.createAccount()
      expect(Wallet.createAccount).toHaveBeenCalled()
    )

    it "should increase the number of accounts", inject((Wallet, MyWallet) ->
      before = Wallet.accounts.length
      Wallet.createAccount("Some name", (()->))
      expect(Wallet.accounts.length).toBe(before + 1)
      return
    )

    it "should set a name", inject((Wallet, MyWallet) ->
       Wallet.createAccount("Savings", (()->))
       expect(Wallet.accounts[Wallet.accounts.length - 1].label).toBe("Savings")
    )

    return
