describe('SecondPasswordCtrl', () => {
  let scope;
  let modalInstance = {
    close () {},
    dismiss () {}
  };

  let $controller;

  beforeEach(angular.mock.module('walletApp'));

  beforeEach(function () {
    angular.mock.inject(function ($injector, $rootScope, $controller, $q) {
      let Wallet = $injector.get('Wallet');
      let MyWallet = $injector.get('MyWallet');

      MyWallet.wallet = {
        validateSecondPassword(password) {
          return password === 'correct_password';
        }
      };

      scope = $rootScope.$new();

      $controller('SecondPasswordCtrl', {
        $scope: scope,
        $stateParams: {},
        $uibModalInstance: modalInstance,
        insist: false,
        defer: $q.defer()
      }
      );

      spyOn(modalInstance, 'close');

    });

  });

  it('should clear alerts', inject(function (Alerts) {
    spyOn(Alerts, 'clear');
    scope.cancel();
    expect(Alerts.clear).toHaveBeenCalled();
  })
  );

  it('should close the modal when password is correct', () => {
    scope.secondPassword = "correct_password";
    scope.submit();
    expect(modalInstance.close).toHaveBeenCalled();
  });

  it('should close the modal when password is wrong', () => {
    scope.secondPassword = "wrong_password";
    scope.submit();
    expect(modalInstance.close).not.toHaveBeenCalled();
  });
});
