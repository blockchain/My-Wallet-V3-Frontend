describe('ConfirmRecoveryPhraseCtrl', () => {
  let scope;
  let modalInstance = {
    close () {},
    dismiss () {}
  };

  beforeEach(angular.mock.module('walletApp'));

  beforeEach(function () {
    angular.mock.inject(function ($injector, $rootScope, $controller) {
      let Wallet = $injector.get('Wallet');
      let MyWallet = $injector.get('MyWallet');

      MyWallet.wallet = {
        isDoubleEncrypted: false
      };

      Wallet.getMnemonic = success => success('a b c d e f g h i j k l');

      scope = $rootScope.$new();

      $controller('ConfirmRecoveryPhraseCtrl', {
        $scope: scope,
        $stateParams: {},
        $uibModalInstance: modalInstance
      }
      );

    });

  });

  it('should get mnemonic at 2nd step', inject(function (Wallet) {
    scope.goToShow();
    expect(scope.recoveryPhrase).not.toBe(null);
  })
  );

  it('should verify', inject(function (Wallet) {
    for (let word of Array.from(scope.words)) {
      word.value = (word.actual = 'word');
    }

    scope.$apply();

    spyOn(Wallet, 'confirmRecoveryPhrase');

    scope.verify();

    expect(Wallet.confirmRecoveryPhrase).toHaveBeenCalled();
    expect(scope.step).toBe(3);

  })
  );

  describe('pure coverage', () => {
    it('covers close', () => scope.close());

    it('covers goToVerify', () => scope.goToVerify());
  });
});
