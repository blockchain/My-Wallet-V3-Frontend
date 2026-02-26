describe("walletServices", function() {
  let Wallet = undefined;

  let mockObserver = undefined;
  let errors = undefined;

  let account = undefined;

  beforeEach(angular.mock.module("walletApp"));

  beforeEach(function() {
    angular.mock.inject(function($injector) {
      Wallet = $injector.get("Wallet");
      Wallet.addressBook = {"17gJCBiPBwY5x43DZMH3UJ7btHZs6oPAGq" : "John"};
      Wallet.legacyAddresses = [{label: "Old Label"}];

      account = {
        index: 0,
        setLabelForReceivingAddress() {
          return {
            then() {
              return {catch() {}};
            }
          };
        },
        receivingAddressesLabels: []
      };

      Wallet.my.wallet = {
        hdwallet: {
          accounts:
            [
              account
            ]
        }
      };

      Wallet.status.isLoggedIn = true;

      spyOn(Wallet,"monitor").and.callThrough();

      mockObserver = {needs2FA() {}};

    });

  });
  describe("addressBook()", function() {
    it("should find John", inject(function(Wallet) {
      expect(Wallet.addressBook["17gJCBiPBwY5x43DZMH3UJ7btHZs6oPAGq"]).toBe("John");
    })
    );

  });

  return describe("address label", () =>
    it("can be set for a legacy address", function() {
      pending();
      let address = Wallet.legacyAddresses()[0];
      spyOn(Wallet.store, "setLegacyAddressLabel");
      Wallet.changeAddressLabel(address, "New Label", (function(){}));
      return expect(Wallet.store.setLegacyAddressLabel).toHaveBeenCalled();
    })
  );
});
