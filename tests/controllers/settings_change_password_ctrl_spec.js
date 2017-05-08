describe('ChangePasswordCtrl', () => {
  let scope;
  let Wallet;

  let strongPassword = 't3stp@ssw0rd';

  beforeEach(angular.mock.module('walletApp'));

  beforeEach(function () {
    angular.mock.inject(function ($injector, $rootScope, $controller, $compile, $templateCache) {
      Wallet = $injector.get('Wallet');

      Wallet.user = {
        uid: "12345678-1234-1234-1234-1234567890ab",
        email: "user@blockchain.com"
      };

      spyOn(Wallet, "isCorrectMainPassword").and.callFake(pwd => pwd === "test");

      scope = $rootScope.$new();
      let template = $templateCache.get('partials/settings/change-password.pug');

      $controller("ChangePasswordCtrl", {
        $scope: scope,
        $stateParams: {}
      });

      scope.model = {};
      $compile(template)(scope);

      scope.status = {};
      scope.reset();
      scope.$digest();

    });

  });

  it("should get model values from the form", (function () {
    scope.form.currentPassword.$setViewValue('test');
    expect(scope.fields.currentPassword).toBe('test');

    scope.form.password.$setViewValue(strongPassword);
    expect(scope.fields.password).toBe(strongPassword);

    scope.form.confirmation.$setViewValue(strongPassword);
    expect(scope.fields.confirmation).toBe(strongPassword);
  })
  );

  describe('change', () => {

    it("should be able to change password", inject(function (Wallet) {
      spyOn(Wallet, "changePassword");
      scope.form.currentPassword.$setViewValue('test');
      scope.form.password.$setViewValue(strongPassword);
      scope.form.confirmation.$setViewValue(strongPassword);
      scope.change();
      expect(Wallet.changePassword).toHaveBeenCalled();
    })
    );

    it("should not be able to change password if form is invalid", inject(function (Wallet) {
      spyOn(Wallet, "changePassword");
      expect(scope.form.$invalid).toBe(true);
      scope.change();
      expect(Wallet.changePassword).not.toHaveBeenCalled();
    })
    );
  });

  describe('validate', () => {

    it('should not be valid if all fields are empty', () => {
      expect(scope.form.$invalid).toBe(true);
      expect(scope.form.$valid).toBe(false);
    });

    it('should be valid if all fields are valid', () => {
      scope.form.currentPassword.$setViewValue('test');
      scope.form.password.$setViewValue(strongPassword);
      scope.form.confirmation.$setViewValue(strongPassword);
      expect(scope.form.$invalid).toBe(false);
      expect(scope.form.$valid).toBe(true);
    });

    describe('currentPassword', () => {

      it('should fail if currentPassword is wrong', () => {
        scope.form.currentPassword.$setViewValue('wrong');
        expect(scope.form.currentPassword.$error.isValid).toBe(true);
      });

      it('should pass if currentPassword is correct', () => {
        scope.form.currentPassword.$setViewValue('test');
        expect(scope.form.currentPassword.$error.isValid).not.toBe(true);
      });
    });

    describe('password', () => {

      it('should display an error if the new password is too weak', () => {
        scope.form.password.$setViewValue('a');
        expect(scope.form.password.$error.minEntropy).toBe(true);
      });

      it('should display an error if the new password is too long', () => {
        scope.form.password.$setViewValue(new Array(257).join('x'));
        expect(scope.form.password.$error.maxlength).toBe(true);
      });

      it('should display an error if the new password is the users guid', () => {
        scope.form.password.$setViewValue("12345678-1234-1234-1234-1234567890ab");
        expect(scope.form.password.$error.isValid).toBe(true);
      });

      it('should display an error if the new password is the users email', () => {
        scope.form.password.$setViewValue("user@blockchain.com");
        expect(scope.form.password.$error.isValid).toBe(true);
      });

      it('should display an error if the new password is the users current password', () => {
        scope.form.password.$setViewValue("test");
        expect(scope.form.password.$error.isValid).toBe(true);
      });

      it('should be valid if all requirements are met', () => {
        scope.form.password.$setViewValue(strongPassword);
        expect(scope.form.password.$valid).toBe(true);
        expect(scope.form.password.$invalid).toBe(false);
      });
    });

    describe('confirmation', () => {

      it('should not display an error if password confirmation matches', () => {
        scope.form.password.$setViewValue('testing');
        scope.form.confirmation.$setViewValue('testing');
        expect(scope.form.confirmation.$error.isValid).not.toBe(true);
      });

      it('should display an error if password confirmation does not match', () => {
        scope.form.password.$setViewValue('testing');
        scope.form.confirmation.$setViewValue('different');
        expect(scope.form.confirmation.$error.isValid).toBe(true);
      });
    });
  });
});
