describe('CoinifyEmailComponentController', () => {
  let ctrlName = "coinifyEmail";
  let ctrl;
  let bindings;
  let Wallet;
  let $rootScope;
  let $componentController;

  let func = jasmine.any(Function);

  beforeEach(angular.mock.module('walletApp'));

  beforeEach(() =>
    angular.mock.inject(function ($injector, _$rootScope_, _$componentController_, _$q_, _$timeout_) {
      $rootScope = _$rootScope_;
      $componentController = _$componentController_;
      let $q = _$q_;

      bindings = {
        email: "test@example.com",
        verified: false,
        validEmail: true,
        onComplete: jasmine.createSpy('onComplete')
      };

      Wallet = $injector.get('Wallet');
      Wallet.goal = {};
      Wallet.changeEmail = (email, succ, err) => succ();
      return Wallet.resendEmailConfirmation = () => $q.resolve();
    })
  );

  describe('$onInit', function () {
    beforeEach(function () {
      spyOn(Wallet, "resendEmailConfirmation");
      return ctrl = $componentController(ctrlName, null, bindings);
    });

    it('should send resend email if not verified', () => {
      ctrl.$onInit();
      return expect(Wallet.resendEmailConfirmation).toHaveBeenCalled();
    });

    it('should not send resend email if user just created a wallet', () => {
      Wallet.goal.firstLogin = true;
      ctrl.$onInit();
      return expect(Wallet.resendEmailConfirmation).not.toHaveBeenCalled();
    });
  });

  describe('$onChanges', () =>
    it('should complete step if verified is true', () => {
      ctrl = $componentController(ctrlName, null, bindings);
      expect(bindings.onComplete).not.toHaveBeenCalled();
      ctrl.$onChanges({verified: {currentValue: 1}});
      return expect(bindings.onComplete).toHaveBeenCalled();
    })
  );

  describe('toggleEditing', () =>
    it('should toggle', () => {
      ctrl = $componentController(ctrlName, null, bindings);
      expect(ctrl.state.editing).toEqual(false);
      ctrl.toggleEditing();
      expect(ctrl.state.editing).toEqual(true);
      ctrl.toggleEditing();
      return expect(ctrl.state.editing).toEqual(false);
    })
  );

  describe('changeEmail', () => {
    beforeEach(function () {
      ctrl = $componentController(ctrlName, null, bindings);
      return ctrl.state.editing = true;
    });

    it('should call Wallet.changeEmail with correct args', () => {
      spyOn(Wallet, "changeEmail").and.callThrough();
      ctrl.changeEmail(bindings.email);
      return expect(Wallet.changeEmail).toHaveBeenCalledWith(bindings.email, func, func);
    });

    it('should call success callback', () => {
      let success = jasmine.createSpy('success');
      ctrl.changeEmail(bindings.email, success);
      $rootScope.$digest();
      return expect(success).toHaveBeenCalled();
    });

    it('should set editing to false', () => {
      ctrl.changeEmail();
      $rootScope.$digest();
      return expect(ctrl.state.editing).toEqual(false);
    });
  });
});
