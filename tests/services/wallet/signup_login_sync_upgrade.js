describe("walletServices", function() {
  let Wallet = undefined;
  let errors = undefined;
  let callbacks = undefined;

  beforeEach(angular.mock.module("walletApp"));

  beforeEach(function() {
    angular.mock.inject(function($injector, $q) {

      Wallet = $injector.get("Wallet");

      Wallet.my = {
        login(uid, password, credentials, callbacks) {
          return {
            then(cb) {
              if (uid === "test-2FA") {
                if (credentials.twoFactor && (credentials.twoFactor.code != null)) {
                  cb({guid: uid, sessionToken: "token"});
                } else {
                  callbacks.needsTwoFactorCode(4);
                }
              } else {
                cb({guid: uid, sessionToken: "token"});
              }
              return {
                catch() {}
              };
            }
          };
        },
        logout() {
          return Wallet.monitor("logging_out");
        },

        wallet: {
          isUpgradedToHD: true,
          hdwallet: {
            isMnemonicVerified: true,
            accounts: [{balance: 1, archived: false},{balance: 2, archived: false}]
          },
          newAccount() {},
          getHistory() {
            return {
              then() {
                return {then() {}};
              }
            };
          },
          txList: {
            transactions() {
              return [{ result: 1, txType: 'received' }];
            },
            fetchTxs() {}
          },
          keys: [{address: "some_legacy_address", label: "Old", archived: false}, {address: "some_legacy_address_without_label", label: "some_legacy_address_without_label", archived: false}],
          fetchAccountInfo() {
            return {
              then(cb) {
                return cb({
                  ip_lock: false
                });
              }
            };
          },
          accountInfo: {
            email: "a@b.com"
          },
          loadExternal() {
            return {};
          }
        },

        createNewWallet(email, pwd, firstAccount, language, currency, success, fail) {
          return success();
        }
      };

      Wallet.my.fetchMoreTransactionsForAll = (success,error,allTransactionsLoaded) => success();

      spyOn(Wallet,"monitor").and.callThrough();

    });

  });

  describe("login()", function() {
    pending();
    beforeEach(function() {
      spyOn(Wallet.my, "login").and.callThrough();
      return Wallet.login();
    });

    it("should fetch and decrypt the wallet", inject(function(Wallet) {
      expect(Wallet.my.login).toHaveBeenCalled();

    })
    );

    it("should update the status", inject(function(Wallet) {
      expect(Wallet.status.isLoggedIn).toBe(true);
    })
    );

    it("should get the currency", inject(function(Wallet) {
      expect(Wallet.settings.currency.code).toEqual("USD");
    })
    );


    it("should get a list of accounts", inject(function(Wallet) {
      expect(Wallet.accounts().length).toBeGreaterThan(1);
      expect(Wallet.accounts()[0].balance).toBeGreaterThan(0);

    })
    );

    it("should get a list of legacy addresses", inject(function(Wallet) {
      expect(Wallet.legacyAddresses().length).toEqual(2);

    })
    );

    it("should use address as label if no label is given", inject(function(Wallet) {
      expect(Wallet.legacyAddresses()[0].label).toEqual("Old");
      expect(Wallet.legacyAddresses()[1].label).toEqual("some_legacy_address_without_label");

    })
    );

    return it("should know the current IP", inject(Wallet => expect(Wallet.user.current_ip).toBeDefined())
    );
  });

  describe("2FA login()", function() {
    callbacks =
      {needs2FA() {}};

    beforeEach(() => spyOn(callbacks, "needs2FA"));

    it("should ask for a code", inject(function(Wallet) {
      Wallet.login("test-2FA", "password", null, callbacks.needs2FA, (function(){}), (function(){}));
      return expect(callbacks.needs2FA).toHaveBeenCalled();
    })
    );

    it("should specify the 2FA method", inject(function(Wallet) {
      Wallet.login("test-2FA", "password", null, callbacks.needs2FA, (function(){}), (function(){}));
      return expect(callbacks.needs2FA).toHaveBeenCalledWith(4);
    })
    );

    return it("should login with  2FA code", inject(function(Wallet) {
      spyOn(Wallet.my.wallet, "fetchAccountInfo").and.callFake(() => ({
        then() {} // Do nothing, so execution stops
      }) );
      Wallet.settings.twoFactorMethod = 4;
      Wallet.login("test-2FA", "password", "1234567", (function() {}), (function(){}), (function(){}));
      return expect(Wallet.my.wallet.fetchAccountInfo).toHaveBeenCalled();
    })
    );
  });

  describe("2FA settings", function() {
    pending();
    return it("can be disabled", inject(function(Wallet) {
      Wallet.settings_api.unsetTwoFactor = success => success();

      spyOn(Wallet.settings_api, "unsetTwoFactor").and.callThrough();

      Wallet.login(null, "test-2FA", "test", null, (function() {}), (function(){}), (function(){}));

      Wallet.disableSecondFactor();

      expect(Wallet.settings_api.unsetTwoFactor).toHaveBeenCalled();
      expect(Wallet.settings.needs2FA).toBe(false);
      return expect(Wallet.settings.twoFactorMethod).toBe(null);


    })
    );
  });


  describe("logout()", function() {
    it("should call MyWallet.logout", inject(function(Wallet) {
      spyOn(Wallet.my, "logout");
      Wallet.logout();
      expect(Wallet.my.logout).toHaveBeenCalled();

    })
    );

  });

  describe("isSyncrhonizedWithServer()", function() {
    beforeEach(function() {});

    return it("should be in sync after first load", inject(function(Wallet) {
      expect(Wallet.isSynchronizedWithServer()).toBe(true);
    })
    );
  });

  describe("HD upgrade", function() {
    beforeEach(function() {
      Wallet.my.wallet.upgradeToHDWallet = function() {};
      return Wallet.my.wallet.newHDWallet = function() {};
    });

    return it("should prompt the user if upgrade to HD is needed", inject(function($rootScope, $timeout) {
      pending();
      spyOn($rootScope, '$broadcast').and.callThrough();

      Wallet.monitor("hd_wallets_does_not_exist");

      $timeout.flush();

      expect($rootScope.$broadcast).toHaveBeenCalled();
      return expect($rootScope.$broadcast.calls.argsFor(2)[0]).toEqual("needsUpgradeToHD");
    })
    );
  });

  return describe("signup", function() {
    pending();

    it("should create a wallet", function() {
      callbacks = {
        success() {}
      };

      spyOn(callbacks, "success");

      Wallet.create("1234567890", "a@b.com","EUR", "EN", callbacks.success);

      return expect(callbacks.success).toHaveBeenCalled();
    });

    it("should not prompt user for HD upgrade", inject(function($rootScope) {
      callbacks = {
        success(uid) {
          return Wallet.login(null, uid, "1234567890");
        }
      };

      Wallet.create("1234567890", "a@b.com", "EUR", "EN", callbacks.success);

      spyOn($rootScope, '$broadcast').and.callThrough();

      return expect($rootScope.$broadcast).not.toHaveBeenCalled();
    })
    );


    return it("should add uid to cookies", inject(function(localStorageService) {
      spyOn(localStorageService, 'set');
      Wallet.create("1234567890", "a@b.com", "EUR", "EN", callbacks.success);
      return expect(localStorageService.set).toHaveBeenCalledWith('uid', "new_guid");
    })
    );
  });
});
