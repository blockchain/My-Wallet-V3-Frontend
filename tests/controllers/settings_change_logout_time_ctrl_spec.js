describe('ChangeLogoutTimeCtrl', () => {
  let scope;
  let Wallet;

  beforeEach(angular.mock.module('walletApp'));

  beforeEach(inject(($httpBackend) => {
    // TODO: use Wallet mock, so we don't need to mock this $httpBackend call
    $httpBackend.whenGET('/Resources/wallet-options.json').respond();
  }));

  beforeEach(() =>
    angular.mock.inject(function ($injector, $rootScope, $controller, $compile, $templateCache) {
      Wallet = $injector.get('Wallet');
      Wallet.settings.logoutTimeMinutes = 10;

      scope = $rootScope.$new();
      let template = $templateCache.get('partials/settings/change-logout.pug');

      $controller('ChangeLogoutTimeCtrl',
        {$scope: scope});

      scope.model = {};
      $compile(template)(scope);

      scope.status = {};
      scope.reset();
      return scope.$digest();
    })
  );

  it('should have an ipWhitelist field', () => expect(scope.fields.logoutTime).toBe(10));

  it('should change the whitelist', inject(function (Wallet) {
    spyOn(Wallet, 'setLogoutTime');
    scope.fields.logoutTime = 100;
    scope.setLogoutTime();
    expect(Wallet.setLogoutTime).toHaveBeenCalled();
  })
  );
});
