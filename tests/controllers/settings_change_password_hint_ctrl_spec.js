describe('ChangePasswordHintCtrl', () => {
  let scope;
  let Wallet;

  beforeEach(angular.mock.module('walletApp'));

  beforeEach(function () {
    angular.mock.inject(function ($injector, $rootScope, $controller, $compile, $templateCache) {

      scope = $rootScope.$new();
      let template = $templateCache.get('partials/settings/change-password-hint.pug');

      $controller("ChangePasswordHintCtrl",
        {$scope: scope});

      scope.model = {};
      $compile(template)(scope);

      scope.status = {};
      scope.reset();
      scope.$digest();

    });

  });

  it("should have a password hint field", () => expect(scope.fields.passwordHint).toBe(''));

  it("should change the password hint", inject(function (Wallet) {
    spyOn(Wallet, 'changePasswordHint');
    scope.fields.passwordHint = "passwordhint";
    scope.changePasswordHint();
    expect(Wallet.changePasswordHint).toHaveBeenCalled();
  })
  );
});
