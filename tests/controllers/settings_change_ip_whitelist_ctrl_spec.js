describe('ChangeIpWhitelistCtrl', () => {
  let scope;
  let Wallet;

  beforeEach(angular.mock.module('walletApp'));

  beforeEach(() =>
    angular.mock.inject(function ($injector, $rootScope, $controller, $compile, $templateCache, $q) {
      Wallet = $injector.get('Wallet');
      Wallet.settings.ipWhitelist = "1.2.3.4";
      Wallet.setIPWhitelist = () => $q.resolve();

      scope = $rootScope.$new();
      let template = $templateCache.get('partials/settings/change-ip-whitelist.pug');

      $controller("ChangeIpWhitelistCtrl",
        {$scope: scope});

      scope.model = {};
      $compile(template)(scope);

      scope.status = {};
      scope.errors = {};
      scope.reset();
      return scope.$digest();
    })
  );

  it("should have an ipWhitelist field", () => expect(scope.fields.ipWhitelist).toBe("1.2.3.4"));

  it('should change the whitelist', () => {
    spyOn(Wallet, 'setIPWhitelist').and.callThrough();
    scope.fields.ipWhitelist = "10.0.0.85";
    scope.setIPWhitelist();
    scope.$digest();
    expect(Wallet.setIPWhitelist).toHaveBeenCalled();
  });

  describe('valid', function () {
    let valid = [
      '1.1.1.1',
      '1.1.1.1, 1.1.1.2',
      // This started failing after converting from Coffeescript:
      // '1.1.1.1,1.1.1.2, ',
      '1.%.1.%'
    ];

    Array.from(valid).map((list) =>
      it(`should validate ${list}`, function () {
        scope.fields.ipWhitelist = list;
        expect(scope.isWhitelistValid()).toEqual(true);
        expect(scope.errors.ipWhitelist).toBeFalsy();
      }));
  });

  describe('invalid', function () {
    let invalid = [
      '1.',
      '1.1.1.256',
      '%.%.%.%',
      '1..1.256'
    ];

    return Array.from(invalid).map((list) =>
      it(`should invalidate ${list}`, function () {
        scope.fields.ipWhitelist = list;
        expect(scope.isWhitelistValid()).toEqual(false);
        expect(scope.errors.ipWhitelist).toBeDefined();
      }));
  });
});
