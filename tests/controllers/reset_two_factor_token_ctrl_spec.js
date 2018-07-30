describe('ResetTwoFactorTokenController', () => {
  let scope;

  beforeEach(angular.mock.module('walletApp'));

  beforeEach(function () {
    angular.mock.inject(function ($injector, $rootScope, $controller) {
      let WalletTokenEndpoints = $injector.get('WalletTokenEndpoints');
      let $state = $injector.get('$state'); // This is a mock
      let Alerts = $injector.get('Alerts');

      spyOn(WalletTokenEndpoints, 'resetTwoFactor').and.callThrough();
      spyOn($state, 'go').and.callThrough();

      spyOn(Alerts, 'displayError').and.callFake(function () {});
      spyOn(Alerts, 'displayResetTwoFactor').and.callFake(function () {});
    });
  });

  describe('with token', () => {
    beforeEach(() =>
      angular.mock.inject(function ($controller, $rootScope) {
        scope = $rootScope.$new();

        return $controller('ResetTwoFactorTokenCtrl', {
          $scope: scope,
          $stateParams: {token: 'token'}
        });
      }));

    it('should show call WalletTokenEndpoints.resetTwoFactor)', inject(WalletTokenEndpoints => expect(WalletTokenEndpoints.resetTwoFactor).toHaveBeenCalled())
    );

    it('should pass the token parameter along', inject(WalletTokenEndpoints => {
      expect(WalletTokenEndpoints.resetTwoFactor).toHaveBeenCalledWith('token');
    }));

    it('should redirect to the login page', inject($state => {
      expect($state.go).toHaveBeenCalledWith('public.login-uid', {uid: '1234'});
    }));

    it('should request a modal success message', inject(Alerts => expect(Alerts.displayResetTwoFactor).toHaveBeenCalled())
    );
  });

  describe('with wrong token', () => {
    beforeEach(() =>
      angular.mock.inject(function ($controller, $rootScope) {
        scope = $rootScope.$new();

        return $controller('ResetTwoFactorTokenCtrl', {
          $scope: scope,
          $stateParams: {token: 'wrong-token'}
        });
      }));

    it('should display an error message', inject(Alerts => expect(Alerts.displayError).toHaveBeenCalled())
    );

    it('should redirect to the login page', inject($state => expect($state.go).toHaveBeenCalledWith('public.login-no-uid'))
    );
  });
});
