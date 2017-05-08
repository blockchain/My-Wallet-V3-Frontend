describe('ChangeEmailCtrl', () => {
  let scope;
  let Wallet;

  beforeEach(angular.mock.module('walletApp'));

  beforeEach(function () {
    angular.mock.inject(function ($injector, $rootScope, $controller, $compile, $templateCache) {
      Wallet = $injector.get('Wallet');
      let MyWallet = $injector.get('MyWallet');

      Wallet.user.email = "a@b.com";
      MyWallet.wallet = {
        external: {}
      };

      scope = $rootScope.$new();
      let template = $templateCache.get('partials/settings/change-email.pug');

      $controller('ChangeEmailCtrl',
        {$scope: scope});

      scope.model = {};
      $compile(template)(scope);

      scope.status = {};
      scope.reset();
      scope.$digest();

    });

  });

  it('should have an email field', () => expect(scope.fields.email).toBe("a@b.com"));

  it('should change an email', inject(function (Wallet) {
    spyOn(Wallet, 'changeEmail');
    scope.fields.email = "steve@jobs.com";
    scope.changeEmail();
    expect(Wallet.changeEmail).toHaveBeenCalled();
  })
  );

  describe('isProblemProvider', () => {
    it('should detect a reported mail provider', () => {
      let isProblem = scope.isProblemProvider('user@aol.com');
      expect(isProblem).toEqual(true);
    });

    it('should return false for an ok mail provider', () => {
      let isProblem = scope.isProblemProvider('user@gmail.com');
      expect(isProblem).toEqual(false);
    });

    it('should return false if passed a non-email', () => {
      expect(scope.isProblemProvider()).toEqual(false);
      expect(scope.isProblemProvider(null)).toEqual(false);
      expect(scope.isProblemProvider(false)).toEqual(false);
      expect(scope.isProblemProvider('')).toEqual(false);
    });
  });
});
