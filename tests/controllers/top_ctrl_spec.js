describe('TopCtrl', () => {
  let scope;

  let Wallet;

  let modal =
    {open() {}};

  beforeEach(angular.mock.module('walletApp'));

  beforeEach(function () {
    angular.mock.inject(function ($injector, $rootScope, $controller) {
      Wallet = $injector.get('Wallet');
      let MyWallet = $injector.get('MyWallet');

      Wallet.status = {isLoggedIn: true};

      scope = $rootScope.$new();

      MyWallet.wallet = {
        isUpgradedToHD: true,
        keys: [
          { address: '1asdf', archived: false }, { address: '1asdf', archived: true }
        ]
      };

      $controller('TopCtrl', {
        $scope: scope,
        $stateParams: {},
        $uibModal: modal
      }
      );

    });

  });

  it('should have access to login status',  inject(() => expect(scope.status.isLoggedIn).toBe(true))
  );

  it('should have access to total balance',  inject(function (Wallet) {
    Wallet.total = () => 1;
    expect(scope.getTotal()).toBe(1);
  })
  );

  it('should show Fiat if USD is set as display currency', inject(function (Wallet) {
    Wallet.settings.displayCurrency = {code: 'USD'};
    expect(scope.isBitCurrency(scope.settings.displayCurrency)).toBe(false);
  })
  );

  it('should not show Fiat if BTC is set as display currency', inject(function (Wallet) {
    Wallet.settings.displayCurrency = {code: 'BTC'};
    expect(scope.isBitCurrency(scope.settings.displayCurrency)).toBe(true);
  })
  );
});
