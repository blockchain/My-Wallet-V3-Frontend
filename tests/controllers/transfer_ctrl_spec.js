describe('TransferControllerSpec', () => {
  let Wallet;
  let scope;
  let rootScope;
  let controller;

  let spendableAddresses = [
    { label: 'addr1', balance: 10000 },
    { label: 'addr2', balance: 20000 }
  ];

  let modalInstance = {
    close () {},
    dismiss () {}
  };

  let getControllerScope = function (address) {
    let s = rootScope.$new();

    controller("TransferController", {
      $scope: s,
      $uibModalInstance: modalInstance,
      address
    }
    );

    s.$digest();
    return s;
  };

  beforeEach(angular.mock.module('walletApp'));

  beforeEach(() =>
    angular.mock.inject(function ($injector, $rootScope, $controller, $q) {
      rootScope = $rootScope;
      controller = $controller;

      Wallet = $injector.get('Wallet');
      let MyWallet = $injector.get('MyWallet');
      let MyWalletPayment = $injector.get('MyWalletPayment');

      Wallet.accounts = () => [{label: 'Savings'}, {label: 'Party Money'}];
      Wallet.legacyAddresses = () => spendableAddresses;
      Wallet.askForSecondPasswordIfNeeded = () => $q.resolve('pw');

      MyWallet.wallet = {
        createPayment () { return new MyWalletPayment(); },
        hdwallet: {
          defaultAccount: { label: 'Default', index: 1 }
        }
      };

      return scope = getControllerScope(spendableAddresses);
    })
  );

  it('should select the default account', () => expect(scope.selectedAccount.label).toEqual('Default'));

  it('should convert a single address to an array', () => {
    scope = getControllerScope({ label: 'single_address' });
    expect(Array.isArray(scope.addresses)).toEqual(true);
    expect(scope.addresses[0].label).toEqual('single_address');
  });

  it('should combine the balances of addresses', () => expect(scope.combinedBalance).toEqual(30000));
});
