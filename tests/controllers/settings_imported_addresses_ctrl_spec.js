describe('SettingsImportedAddressesCtrl', () => {
  let scope;
  let Wallet;

  let modal =
    {open() {}};

  beforeEach(angular.mock.module('walletApp'));

  beforeEach(function () {
    angular.mock.inject(function ($injector, $rootScope, $controller) {
      Wallet = $injector.get('Wallet');
      let Alerts = $injector.get('Alerts');

      Alerts.confirm = () => ({then(f) { return f(true); }});

      let legacyAddresses = [{archived: false},{archived: true}];

      Wallet.legacyAddresses = () => legacyAddresses;

      Wallet.my = {
        wallet: {
          deleteLegacyAddress () {
            return legacyAddresses.pop();
          },
          keys: legacyAddresses
        }
      };

      scope = $rootScope.$new();

      $controller('SettingsImportedAddressesCtrl', {
        $scope: scope,
        $stateParams: {},
        $uibModal: modal,
        Wallet
      }
      );

    });

  });

  describe('legacy addresses', () => {
    it('can be unarchived', () => {
      let address = scope.legacyAddresses()[1];
      expect(address.archived).toBe(true);
      scope.unarchive(address);
      expect(address.archived).toBe(false);
    });

    it('can be deleted', inject(function (Wallet, $uibModal) {
      let address = scope.legacyAddresses()[1];
      let before = scope.legacyAddresses().length;

      spyOn(Wallet, 'deleteLegacyAddress').and.callThrough();

      scope.delete(address);
      expect(Wallet.deleteLegacyAddress).toHaveBeenCalled();

      expect(scope.legacyAddresses().length).toBe(before - 1);
    })
    );
  });

  describe('importAddress()', () =>
    it('should open a modal',  inject(function ($uibModal) {
      spyOn(modal, 'open');
      scope.importAddress();
      expect(modal.open).toHaveBeenCalled();
    })
    )
  );

  describe('toggling archived addresses', () =>
    it('should toggle archived address', () => {
      spyOn(scope, 'toggleDisplayArchived').and.callThrough();
      scope.toggleDisplayArchived();
      expect(scope.toggleDisplayArchived).toHaveBeenCalled();
      expect(scope.display.archived).toBe(true);
    })
  );
});
