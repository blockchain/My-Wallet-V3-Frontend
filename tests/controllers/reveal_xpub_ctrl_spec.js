describe('RevealXpubCtrl', () => {
  let Wallet;
  let scope;
  let accounts = [{label: 'Savings', extendedPublicKey: "xpub0"}, {label: 'Party Money', xpub: "xpub1"}];

  let modalInstance = {
    close () {},
    dismiss () {}
  };

  beforeEach(angular.mock.module('walletApp'));

  beforeEach(() =>
    angular.mock.inject(function ($injector) {
      Wallet = $injector.get('Wallet');
      let MyWallet = $injector.get('MyWallet');

      Wallet.accounts = () => accounts;

      Wallet.askForSecondPasswordIfNeeded = () =>
        ({
          then(fn) { fn(); return { catch () {} }; }
        })
      ;

      Wallet.my.fetchMoreTransactionsForAll = (success,error,allTransactionsLoaded) => success();

      return MyWallet.wallet = {
        isDoubleEncrypted: false

      };}));

  beforeEach(function () {
    angular.mock.inject(function ($rootScope, $controller, $compile) {
      scope = $rootScope.$new();

      $controller("RevealXpubCtrl", {
        $scope: scope,
        $stateParams: {},
        $uibModalInstance: modalInstance,
        account: Wallet.accounts()[0]
      });

    });
  });

  beforeEach(function () { accounts.splice(2); return accounts[0].label = 'Savings'; });

  it("should show initially hide the xpub and show a warning", () => expect(scope.showXpub).toBe(false));

  it('should allow user to continue to see xpub', () => {
    spyOn(scope, 'continue').and.callThrough();
    scope.continue();
    expect(scope.showXpub).toBe(true);
  });

  it("should show xpub", () => expect(scope.xpub).toBe("xpub0"));
});
