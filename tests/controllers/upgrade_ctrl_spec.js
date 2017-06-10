describe('UpgradeCtrl', () => {
  let scope;
  let Wallet;

  let modalInstance = {
    close () {},
    dismiss () {}
  };

  beforeEach(angular.mock.module('walletApp'));

  beforeEach(function () {
    angular.mock.inject(function ($injector, $rootScope, $controller, $httpBackend) {
      // TODO: use Wallet mock, so we don't need to mock this $httpBackend call
      $httpBackend.whenGET('/Resources/wallet-options.json').respond();

      Wallet = $injector.get('Wallet');

      scope = $rootScope.$new();

      $controller('UpgradeCtrl', {
        $scope: scope,
        $stateParams: {},
        $uibModalInstance: modalInstance
      }
      );
    });
  });

  it('should set waiting to false after timeout', inject(function ($timeout) {
    $timeout.flush();
    expect(scope.waiting).toBeFalsy();
  })
  );

  it('should proceed if user agrees', () => {
    spyOn(Wallet, 'upgrade');

    scope.upgrade();
    expect(Wallet.upgrade).toHaveBeenCalled();
  });
});
