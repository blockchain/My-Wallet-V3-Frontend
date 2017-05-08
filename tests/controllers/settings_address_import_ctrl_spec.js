describe('AddressImportCtrl', () => {
  let scope;
  let Wallet;
  let Alerts;

  let accounts = [{index: 0, label: "Spending", archived: false}];

  let modalInstance = {
    close () {},
    dismiss () {}
  };

  beforeEach(angular.mock.module('walletApp'));

  beforeEach(function () {
    angular.mock.inject(function ($injector, $rootScope, $controller, $compile, $templateCache) {
      Wallet = $injector.get('Wallet');
      Alerts = $injector.get('Alerts');

      Wallet.addAddressOrPrivateKey = function (addressOrPrivateKey, bip38passphrase, success, error, cancel, _error) {
        if (_error) {
          return error(_error);
        } else {
          return success({address: "valid_import_address"});
        }
      };

      Wallet.accounts = () => accounts;

      Wallet.isValidAddress = addr => addr === 'watch_only';
      Wallet.isValidPrivateKey = priv => priv === 'valid_import_address';

      Wallet.my = {
        wallet: {
          keys: [],
          hdwallet: {
            defaultAccountIndex: 0
          }
        }
      };

      Wallet.status = {
        isLoggedIn: true
      };

      Alerts.confirm = () => ({then(f) { return f(true); }});

      scope = $rootScope.$new();
      let template = $templateCache.get('partials/settings/import-address.pug');

      $controller("AddressImportCtrl", {
        $scope: scope,
        $stateParams: {},
        $uibModalInstance: modalInstance,
        address: null
      }
      );

      scope.model = { fields: {} };
      $compile(template)(scope);

      scope.$digest();

    });

  });

  it("should exist", () => expect(scope.close).toBeDefined());

  it("should have access to wallet accounts", inject(Wallet => expect(scope.accounts()).toEqual(Wallet.accounts()))
  );

  describe("enter address or private key", () =>

    it("should go to step 2 when user clicks validate", inject(function ($timeout) {
      scope.fields.addressOrPrivateKey = "valid_import_address";
      expect(scope.step).toBe(1);
      scope.import();
      $timeout.flush();
      expect(scope.step).toBe(2);
    })
    )
  );

  describe('watch only', () => {

    beforeEach(() => scope.fields.addressOrPrivateKey = "watch_only");

    it("should not go to step 2 when the user does not confirm", inject(function ($timeout, $q) {
      spyOn(Alerts, 'confirm').and.returnValue($q.reject('cancelled'));
      expect(scope.step).toBe(1);
      scope.import();
      $timeout.flush();
      expect(scope.step).toBe(1);
      expect(scope.status.busy).toEqual(false);
    })
    );
  });

  describe('validate and add', () => {
    it("should add the address if no errors are present", inject(function ($timeout) {
      scope.fields.addressOrPrivateKey = "valid_import_address";
      scope.import();
      $timeout.flush();
      expect(scope.address.address).toBe("valid_import_address");
    })
    );

    it("should show the balance", inject(function ($timeout) {
      scope.fields.addressOrPrivateKey = "valid_import_address";
      scope.import();
      $timeout.flush();
      expect(scope.address.balance).not.toBe(0);
    })
    );

    describe('error', () => {
      beforeEach(function () {
        scope.success = function () {};
        scope.cancel = function () {};
        return scope.error = function () {};
      });

      it("should handle an error", inject(function ($timeout) {
        spyOn(scope, 'error');
        scope.import();
        $timeout.flush();
        Wallet.addAddressOrPrivateKey('', false, scope.success, scope.error, scope.cancel, 'anyError');
        expect(scope.error).toHaveBeenCalled();
      })
      );
    });

    it("should open the transfer window when the user clicks transfer", inject(function ($uibModal) {
      spyOn($uibModal, 'open');
      scope.goToTransfer();
      expect($uibModal.open).toHaveBeenCalled();
    })
    );
  });

  describe('import', () => {
    describe("success", () =>
      it('should set address and go to next step', () => {
        let address = { address: '1asdf' };
        scope.importSuccess(address);
        expect(scope.status.busy).toEqual(false);
        expect(scope.address).toEqual(address);
        expect(scope.step).toEqual(2);
      })
    );

    describe('error', () => {
      it('should set validity for presentInWallet error', () => {
        scope.importError('presentInWallet');
        expect(scope.importForm.privateKey.$valid).toBe(false);
      });

      it('should set validity for wrongBipPass error', () => {
        scope.importError('wrongBipPass');
        expect(scope.importForm.bipPassphrase.$valid).toBe(false);
      });

      it('should set validity for importError error', () => {
        scope.importError('importError');
        expect(scope.step).toEqual(1);
        expect(scope.BIP38).toEqual(false);
        expect(scope.importForm.privateKey.$valid).toBe(false);
      });

      it('should fall back on an alert', () => {
        spyOn(Alerts, 'displayError');
        scope.importError('unknownError');
        expect(Alerts.displayError).toHaveBeenCalled();
      });
    });

    describe("cancel", () =>
      it('should set busy to false', () => {
        scope.importCancel();
        expect(scope.status.busy).toEqual(false);
      })
    );
  });

  describe('transfer', () => {
    beforeEach(() => scope.address = Wallet.legacyAddresses()[0]);

    it("should have access to accounts", () => expect(scope.accounts()).toBeDefined());

    it("should show a spinner during sweep",  inject(function (Wallet) {
      pending();
      spyOn(Wallet, 'transaction').and.callFake(function (success, error) {
        expect(scope.status.sweeping).toBe(true);
        return {
          sweep () {
            return success();
          }
        };
      });

      expect(scope.status.sweeping).toBe(false);

      scope.transfer();

      // This is called after success:
      expect(scope.status.sweeping).toBe(false);

    })
    );
  });

  describe('parseBitcoinUrl()', () => {
    it("should work with prefix", () => expect(scope.parseBitcoinUrl("1GjW7vwRUcz5YAtF625TGg2PsCAM8fRPEd")).toBe("1GjW7vwRUcz5YAtF625TGg2PsCAM8fRPEd"));

    it("should work without slashes", () => expect(scope.parseBitcoinUrl("bitcoin:1GjW7vwRUcz5YAtF625TGg2PsCAM8fRPEd")).toBe("1GjW7vwRUcz5YAtF625TGg2PsCAM8fRPEd"));

    it("should work with slashes", () => expect(scope.parseBitcoinUrl("bitcoin://1GjW7vwRUcz5YAtF625TGg2PsCAM8fRPEd")).toBe("1GjW7vwRUcz5YAtF625TGg2PsCAM8fRPEd"));
  });
});
