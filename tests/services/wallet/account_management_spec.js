describe("walletServices", function() {
  let Wallet = undefined;
  let MyWallet = undefined;

  let accounts = [{label: 'Savings'}, {label: 'Party Money'}];

  beforeEach(angular.mock.module("walletApp"));

  beforeEach(function() {
    angular.mock.inject(function($injector, $q) {
      Wallet = $injector.get("Wallet");
      MyWallet = $injector.get("MyWallet");

      Wallet.askForSecondPasswordIfNeeded = () =>
        ({
          then(fn) { fn(); return { catch() {} }; }
        })
      ;

      Wallet.accounts = () => accounts;

      Wallet.my.fetchMoreTransactionsForAll = (success,error,allTransactionsLoaded) => success();

      MyWallet.wallet = {
        isDoubleEncrypted: false,
        newAccount(label) { return accounts.push({ label }); },
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
        }
      };

    });
  });

  return describe("createAccount()", function() {

    it("should call generateNewKey()", inject(function(Wallet, MyWallet) {
      spyOn(Wallet, "createAccount");
      Wallet.createAccount();
      return expect(Wallet.createAccount).toHaveBeenCalled();
    })
    );

    it("should increase the number of accounts", inject(function(Wallet, MyWallet) {
      let before = Wallet.accounts().length;
      Wallet.createAccount("Some name", (function(){}));
      expect(Wallet.accounts().length).toBe(before + 1);
    })
    );

    it("should set a name", inject(function(Wallet, MyWallet) {
      Wallet.createAccount("Spending", (function(){}));
      let accts = Wallet.accounts();
      return expect(accts[accts.length - 1].label).toBe("Spending");
    })
    );

  });
});
