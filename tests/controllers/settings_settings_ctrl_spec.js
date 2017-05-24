describe('SettingsCtrl', () => {
  let scope;
  let Wallet;

  beforeEach(angular.mock.module('walletApp'));

  beforeEach(inject(($httpBackend) => {
    // TODO: use Wallet mock, so we don't need to mock this $httpBackend call
    $httpBackend.whenGET('/Resources/wallet-options.json').respond();
  }));

  beforeEach(function () {
    angular.mock.inject(function ($injector, $rootScope, $controller) {
      Wallet = $injector.get('Wallet');
      let MyWallet = $injector.get('MyWallet');

      scope = $rootScope.$new();

      $controller('SettingsCtrl', {
        $scope: scope,
        $stateParams: {}
      }
      );

      scope.$digest();

    });

  });

  it('should load', inject(function (Wallet, Alerts) {
    spyOn(Alerts, 'clear');
    scope.didLoad();
    expect(Alerts.clear).toHaveBeenCalled();
    expect(scope.status).toBe(Wallet.status);
  })
  );
});
