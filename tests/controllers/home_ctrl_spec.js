describe('HomeCtrl', () => {
  let scope;
  let Wallet;
  let modal = {open() {}};

  beforeEach(angular.mock.module('walletApp'));
  beforeEach(function () {
    angular.mock.inject(function ($injector, $rootScope, $controller) {
      Wallet = $injector.get('Wallet');
      let MyWallet = $injector.get('MyWallet');

      MyWallet.wallet = {
        external: {
          sfox: {
            accounts: {}

          }
        },
        hdwallet: {
          accounts: [
            { label: "Checking", index: 0, archived: false, balance: 100 },
            { label: "Savings", index: 1, archived: false, balance: 175 },
            { label: "Spending", index: 2, archived: false, balance: 0 },
            { label: "Partay", index: 3, archived: true, balance: 50 }
          ]
        },
        eth: {
          balance: 1
        },
        bch: {
          balance: 1,
          accounts: [
            { label: "Checking", index: 0, archived: false, balance: 0 }
          ]
        },
        keys: [
          { label: 'Imported', archived: false, balance: 10 }
        ]
      };

      Wallet.status = {
        isLoggedIn: true,
        didLoadBalances: true
      };

      Wallet.total = () => 1;

      scope = $rootScope.$new();

      $controller('HomeCtrl', {
        $scope: scope,
        $uibModal: modal,
        accounts: {}
      }
      );
    });
  });

  describe('totals', () => {
    it('should return total balance of currency', () => {
      expect(scope.btc.total()).toBe(1);
      expect(scope.eth.total()).toBe(0);
      expect(scope.bch.total()).toBe(1);
    });
  });

  describe('isWalletInitialized()', () => {
    it('should return a boolean', () => {
      Wallet.status.isLoggedIn = true;
      Wallet.status.didLoadSettings = true;
      Wallet.status.didLoadTransactions = true;
      expect(scope.isWalletInitialized()).toBe(true);
    })
  });

  describe('activeAccounts()', () => {
    it('should know the number', inject(Wallet => expect(scope.activeAccounts().length).toBeGreaterThan(0))
    );

    it('should be null when not logged in', inject((Wallet), function () {
      Wallet.status.isLoggedIn = false;
      expect(scope.activeAccounts()).toBe(null);
    })
    );
  });

  describe('activeLegacyAddresses()', () => {
    it('should know the number', inject(Wallet => expect(scope.activeLegacyAddresses().length).toBeGreaterThan(0))
    );

    it('should be null when not logged in', inject((Wallet), function () {
      Wallet.status.isLoggedIn = false;
      expect(scope.activeLegacyAddresses()).toBe(null);
    })
    );
  });

  describe('showMobileConversion', () => {
    it('should check localStorageService', inject(function (localStorageService) {
      spyOn(localStorageService, 'get');

      scope.showMobileConversion();
      expect(localStorageService.get).toHaveBeenCalledWith('showMobileConversion');
    })
    );
  });
});
