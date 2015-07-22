describe "walletServices", () ->
  Wallet = undefined
  MyWallet = undefined
  
  accounts = [{label: 'Savings'}, {label: 'Party Money'}]

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
        
      Wallet.accounts = () -> accounts

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

    return
