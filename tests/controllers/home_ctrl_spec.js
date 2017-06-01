describe('HomeCtrl', () => {
  let scope;

  let Wallet;

  let modal =
    {open() {}};

  beforeEach(angular.mock.module('walletApp'));

  beforeEach(function () {
    angular.mock.inject(function ($injector, $rootScope, $controller) {
      Wallet = $injector.get('Wallet');
      let MyWallet = $injector.get('MyWallet');

      MyWallet.wallet = {
        hdwallet: {
          accounts: [
            { label: "Checking", index: 0, archived: false, balance: 100 },
            { label: "Savings", index: 1, archived: false, balance: 175 },
            { label: "Spending", index: 2, archived: false, balance: 0 },
            { label: "Partay", index: 3, archived: true, balance: 50 }
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
        $uibModal: modal
      }
      );
    });
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

  describe('getTotal()', () =>
    it('should return total', () => expect(scope.getTotal()).toEqual(1))
  );
});
