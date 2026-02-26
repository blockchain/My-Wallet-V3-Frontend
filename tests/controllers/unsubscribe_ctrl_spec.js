describe('UnsubscribeController', () => {
  let scope;

  beforeEach(angular.mock.module('walletApp'));

  beforeEach(function () {
    angular.mock.inject(function ($injector, $rootScope, $controller) {
      let WalletTokenEndpoints = $injector.get('WalletTokenEndpoints');
      let $state = $injector.get('$state'); // This is a mock
      let Alerts = $injector.get('Alerts');

      spyOn(WalletTokenEndpoints, 'unsubscribe').and.callThrough();

      spyOn($state, "go").and.callThrough();

      spyOn(Alerts, 'displayError').and.callFake(function () {});
      spyOn(Alerts, 'displaySuccess').and.callFake(function () {});

    });

  });

  describe('with token', () => {
    beforeEach(() =>
      angular.mock.inject(function ($controller, $rootScope) {

        scope = $rootScope.$new();

        return $controller('UnsubscribeCtrl', {
          $scope: scope,
          $stateParams: {token: "token"}
        });}));

    it('should show call WalletTokenEndpoints.unsubscribe()', inject(WalletTokenEndpoints => expect(WalletTokenEndpoints.unsubscribe).toHaveBeenCalled())
    );

    it('should pass the token parameter along', inject(WalletTokenEndpoints => expect(WalletTokenEndpoints.unsubscribe).toHaveBeenCalledWith('token'))
    );

    it('should redirect to the login page', inject($state => {
      expect($state.go).toHaveBeenCalledWith('public.login-uid', { uid: '1234' });
    }));

    it('should request a modal success message', inject(Alerts => expect(Alerts.displaySuccess).toHaveBeenCalled())
    );
  });

  describe('with wrong token', () => {
    beforeEach(() =>
      angular.mock.inject(function ($controller, $rootScope) {

        scope = $rootScope.$new();

        return $controller('UnsubscribeCtrl', {
          $scope: scope,
          $stateParams: {token: "wrong-token"}
        });}));

    it('should display an error message', inject(Alerts=> expect(Alerts.displayError).toHaveBeenCalled())
    );

    it('should redirect to the login page', inject($state=> expect($state.go).toHaveBeenCalledWith("public.login-no-uid"))
    );
  });
});
