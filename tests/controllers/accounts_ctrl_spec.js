describe('WalletNavigationCtrl', () => {
  let scope;

  let Wallet;

  let modal =
    {
      open () {}
    };

  beforeEach(angular.mock.module('walletApp'));

  beforeEach(function () {
    angular.mock.inject(function ($injector, $rootScope, $controller, $httpBackend) {
      // TODO: use Wallet mock, so we don't need to mock this $httpBackend call
      $httpBackend.whenGET('/Resources/wallet-options.json').respond();

      Wallet = $injector.get('Wallet');
      let MyWallet = $injector.get('MyWallet');

      MyWallet.wallet = {
        balanceSpendableActiveLegacy: 100000000,
        keys: [{ archived: false }, { archived: true }],
        hdwallet: {
          accounts: [{ archived: false }, { archived: false }, { archived: true }]
        },
        accountInfo: { invited: false, countryCodeGuess: 'US' }
      };

      Wallet.status.isLoggedIn = true;

      scope = $rootScope.$new();

      $controller('WalletNavigationCtrl', {
        $scope: scope,
        $stateParams: {},
        $uibModal: modal
      }
      );
    });
  });

  describe('numberOfActiveLegacyAddresses()', () => {
    it('should know the number', inject(Wallet => expect(scope.numberOfActiveLegacyAddresses()).toBe(1))
    );

    it('should be null when not logged in', inject((Wallet), function () {
      Wallet.status.isLoggedIn = false;
      expect(scope.numberOfActiveLegacyAddresses()).toBe(null);
    })
    );
  });

  it('should know the number of active acounts', inject(() => {
    expect(scope.numberOfActiveAccounts()).toBe(2);
  }));

  it('should show account based on state', inject(() => {
    expect(scope.showOrHide()).toBe(false);
  }));
});
