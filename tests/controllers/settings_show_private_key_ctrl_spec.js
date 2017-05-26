describe('ShowPrivateKeyCtrl', () => {
  let Wallet;
  let scope;
  let addressObj;
  let askForSecondPassword;

  let modalInstance = {
    close () {},
    dismiss () {}
  };

  beforeEach(angular.mock.module('walletApp'));

  beforeEach(inject(($httpBackend) => {
    // TODO: use Wallet mock, so we don't need to mock this $httpBackend call
    $httpBackend.whenGET('/Resources/wallet-options.json').respond();
  }));

  beforeEach(() =>
    angular.mock.inject(function ($injector, $rootScope, $controller) {

      let MyWallet = $injector.get('MyWallet');
      let MyWalletHelpers = $injector.get('MyWalletHelpers');
      Wallet = $injector.get('Wallet');

      MyWallet.wallet = {
        getPrivateKeyForAddress () { return 'pk.bs58'; }
      };

      MyWalletHelpers.detectPrivateKeyFormat = () => 'base58';
      MyWalletHelpers.privateKeyStringToKey = () => ({ toWIF () { return 'pk.wif'; } });

      scope = $rootScope.$new();

      addressObj = {
        archived: false,
        address: 'some_legacy_address',
        balance: 10000000,
        label: 'Old'
      };

      $controller('ShowPrivateKeyCtrl', {
        $scope: scope,
        $uibModalInstance: modalInstance,
        addressObj
      }
      );

      return scope.$digest();
    })
  );

  it('should have scope variables defined', () => {
    expect(scope.address).toBeDefined();
    expect(scope.balance).toBeDefined();
  });

  it('should have initial private key format data', () => {
    expect(scope.format).toEqual('WIF');
    expect(scope.formats).toEqual(['WIF', 'Base58']);
  });

  it('should be dismissed', () => {
    spyOn(modalInstance, 'dismiss');
    scope.close();
    expect(modalInstance.dismiss).toHaveBeenCalled();
  });

  describe('tryContinue', () => {

    beforeEach(() =>
      angular.mock.inject(function ($q) {
        askForSecondPassword = $q.defer();
        spyOn(Wallet, 'askForSecondPasswordIfNeeded').and.returnValue(askForSecondPassword.promise);
        return spyOn(Wallet.my.wallet, 'getPrivateKeyForAddress').and.callThrough();
      })
    );

    it('should allow access if there is no second password', () => {
      expect(scope.accessAllowed).toBe(false);
      scope.tryContinue();
      expect(Wallet.askForSecondPasswordIfNeeded).toHaveBeenCalled();
      askForSecondPassword.resolve();
      scope.$digest();
      expect(Wallet.my.wallet.getPrivateKeyForAddress).toHaveBeenCalledWith(addressObj, undefined);
      expect(scope.accessAllowed).toBe(true);
    });

    it('should not continue if second password is incorrect', inject(function (Wallet) {
      expect(scope.accessAllowed).toBe(false);
      scope.tryContinue();
      expect(Wallet.askForSecondPasswordIfNeeded).toHaveBeenCalled();
      askForSecondPassword.reject();
      scope.$digest();
      expect(Wallet.my.wallet.getPrivateKeyForAddress).not.toHaveBeenCalled();
      expect(scope.accessAllowed).toBe(false);
    })
    );

    it('should continue if second password is correct', inject(function (Wallet) {
      expect(scope.accessAllowed).toBe(false);
      scope.tryContinue();
      expect(Wallet.askForSecondPasswordIfNeeded).toHaveBeenCalled();
      askForSecondPassword.resolve('password123');
      scope.$digest();
      expect(Wallet.my.wallet.getPrivateKeyForAddress).toHaveBeenCalledWith(addressObj, 'password123');
      expect(scope.accessAllowed).toBe(true);
    })
    );

    it('should set the bs58 and wif private keys', () => {
      scope.tryContinue();
      askForSecondPassword.resolve();
      scope.$digest();
      expect(scope.privKeys.Base58).toBe('pk.bs58');
      expect(scope.privKeys.WIF).toBe('pk.wif');
    });
  });
});
