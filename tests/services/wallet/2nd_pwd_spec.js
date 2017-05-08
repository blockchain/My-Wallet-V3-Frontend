describe("walletServices 2nd pwd", function() {
  let Wallet = undefined;

  beforeEach(angular.mock.module("walletApp"));

  beforeEach(function() {
    angular.mock.inject(function($injector, $q) {

      Wallet = $injector.get("Wallet");

      Wallet.my = {
        wallet: {
          isUpgradedToHD: true,
          hdwallet: {
            isMnemonicVerified: true,
            accounts: [{balance: 1, archived: false},{balance: 2, archived: false}]
          },
          metadata(n) {
            return {
              fetch() { return $q.resolve({lastViewed: 4}); },
              update() { return $q.resolve({lastViewed: 4}); }
            };
          },
          encrypt() {},
          decrypt(password, didDecrypt, error) {
            return didDecrypt();
          }
        }
      };

    });

  });

  describe("setSecondPassword", function() {
    beforeEach(() => spyOn(Wallet.my.wallet, "encrypt"));

    it("should call encrypt()", inject(function($rootScope) {
      Wallet.setSecondPassword();
      $rootScope.$digest();

      return expect(Wallet.my.wallet.encrypt).toHaveBeenCalled();
    })
    );

    return it("should store whatsnew in localstorage", inject(function($rootScope, localStorageService) {
      spyOn(localStorageService, "set");

      Wallet.setSecondPassword();
      $rootScope.$digest();

      return expect(localStorageService.set).toHaveBeenCalled();
    })
    );
  });


  return describe("removeSecondPassword", function() {
    let callbacks = {
      success: () => {},
      error: () => {}
    };

    beforeEach(() => spyOn(Wallet.my.wallet, "decrypt").and.callThrough());

    it("should call decrypt()", inject(function($rootScope) {
      Wallet.removeSecondPassword(callbacks.success, callbacks.error);
      $rootScope.$digest();

      return expect(Wallet.my.wallet.decrypt).toHaveBeenCalled();
    })
    );

    // Delete this test after removing the localstorage fallback
    return it("should use - but not delete - the localstorage entry for whatsnew", inject(function($rootScope, localStorageService) {
      spyOn(localStorageService, "get").and.returnValue(2);
      spyOn(localStorageService, "remove");

      Wallet.removeSecondPassword(callbacks.success, callbacks.error);
      $rootScope.$digest();

      expect(localStorageService.get).toHaveBeenCalled();
      return expect(localStorageService.remove).not.toHaveBeenCalled();
    })
    );
  });
});

    // Uncomment the test below after removing the local storage fallback

    // it "should use and delete the local storage entry for whatsnew", inject(($rootScope, localStorageService) ->
    //   spyOn(localStorageService, "get").and.returnValue(2)
    //   spyOn(localStorageService, "remove")
    //
    //   Wallet.removeSecondPassword(callbacks.success, callbacks.error)
    //   $rootScope.$digest()
    //
    //   expect(localStorageService.get).toHaveBeenCalled()
    //   expect(localStorageService.remove).toHaveBeenCalled()
    // )
