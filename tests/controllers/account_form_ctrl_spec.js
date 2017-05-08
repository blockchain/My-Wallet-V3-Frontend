describe('AccountFormCtrl', () => {
  let Wallet;
  let scope;
  let accounts = [{label: 'Savings'}, {label: 'Party Money'}];

  let modalInstance = {
    close () {},
    dismiss () {}
  };

  beforeEach(angular.mock.module('walletApp'));

  beforeEach(() =>
    angular.mock.inject(function ($injector) {
      Wallet = $injector.get('Wallet');
      let MyWallet = $injector.get('MyWallet');
      Wallet.my.browserCheck = () => true;

      Wallet.accounts = () => accounts;

      Wallet.askForSecondPasswordIfNeeded = () =>
        ({
          then (fn) { fn(); return { catch () {} }; }
        })
      ;

      Wallet.my.fetchMoreTransactionsForAll = (success, error, allTransactionsLoaded) => success();

      MyWallet.wallet = {
        isDoubleEncrypted: false,

        newAccount (label) {
          accounts.push({ label });
        },

        getHistory () {
          return {
            then () {
              return {then () {}};
            }
          };
        },

        txList: {
          fetchTxs () {}
        }
      };
    }));

  beforeEach(() =>
    angular.mock.inject(function ($rootScope, $controller, $compile, $templateCache) {
      scope = $rootScope.$new();
      let template = $templateCache.get('partials/account-form.pug');

      $controller('AccountFormCtrl', {
        $scope: scope,
        $stateParams: {},
        $uibModalInstance: modalInstance,
        account: Wallet.accounts()[0]
      });

      scope.model = { status: {} };
      $compile(template)(scope);

      return scope.$digest();
    })
  );

  beforeEach(function () {
    accounts.splice(2);
    accounts[0].label = 'Savings';
  });

  describe('creation', () => {
    beforeEach(() => scope.name = 'New Account');

    it('should be created', inject(function (Wallet) {
      let before = Wallet.accounts().length;
      scope.createAccount();
      scope.$digest();
      expect(Wallet.accounts().length).toBe(before + 1);
    })
    );

    it('should have a name', inject(function (Wallet) {
      scope.createAccount();
      scope.$digest();
      expect(Wallet.accounts()[Wallet.accounts().length - 1].label).toBe('New Account');
    })
    );
  });

  describe('rename', () => {
    it('original name should be shown', () => {
      expect(scope.name).toBe('Savings');
    });

    it('should save the new name', inject(function (Wallet) {
      scope.name = 'New Name';
      scope.updateAccount();
      expect(Wallet.accounts()[0].label).toBe('New Name');
    }));
  });

  describe('validate', () => {
    beforeEach(function () {
      scope.name = 'Valid Name';
      return scope.$apply();
    });

    it('should not have a null name', () => {
      expect(scope.accountForm.$valid).toBe(true);
      scope.name = null;
      scope.$apply();
      expect(scope.accountForm.$valid).toBe(false);
    });

    it('should not have a name of zero length', () => {
      expect(scope.accountForm.$valid).toBe(true);
      scope.name = '';
      scope.$apply();
      expect(scope.accountForm.$valid).toBe(false);
    });

    it('should not have a name longer than 17 characters', () => {
      expect(scope.accountForm.$valid).toBe(true);
      scope.name = 'abcdefghijklmnopqr';
      scope.$apply();
      expect(scope.accountForm.$valid).toBe(false);
    });

    it('should not create an account with an existing account name', () => {
      expect(scope.isNameUnused('Savings')).toBe(false);
      expect(scope.isNameUnused('New Account')).toBe(true);
    });
  });
});
