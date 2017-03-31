describe "walletServices", () ->
  Wallet = undefined

  mockObserver = undefined
  errors = undefined

  account = undefined

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector) ->
      Wallet = $injector.get("Wallet")
      Wallet.addressBook = {"17gJCBiPBwY5x43DZMH3UJ7btHZs6oPAGq" : "John"}
      Wallet.legacyAddresses = [{label: "Old Label"}]

      account = {
        index: 0
        setLabelForReceivingAddress: () ->
          then: () ->
            catch: () ->
        receivingAddressesLabels: []
      }

      Wallet.my.wallet =
        hdwallet:
          accounts:
            [
              account
            ]

      Wallet.status.isLoggedIn = true

      spyOn(Wallet,"monitor").and.callThrough()

      mockObserver = {needs2FA: (() ->)}

      return

    return
  describe "addressBook()", ->
    it "should find John", inject((Wallet) ->
      expect(Wallet.addressBook["17gJCBiPBwY5x43DZMH3UJ7btHZs6oPAGq"]).toBe("John")
      return
    )

    return

  describe "address label", ->
    it "can be set for a legacy address", ->
      pending()
      address = Wallet.legacyAddresses()[0]
      spyOn(Wallet.store, "setLegacyAddressLabel")
      Wallet.changeAddressLabel(address, "New Label", (()->))
      expect(Wallet.store.setLegacyAddressLabel).toHaveBeenCalled()
