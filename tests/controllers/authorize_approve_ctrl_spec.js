describe('AuthorizeApproveController', () => {
  let scope;

  beforeEach(angular.mock.module('walletApp'));

  beforeEach(function () {
    angular.mock.inject(function ($injector, $rootScope, $controller) {
      let WalletTokenEndpoints = $injector.get('WalletTokenEndpoints');
      let $state = $injector.get('$state'); // This is a mock
      let Alerts = $injector.get('Alerts');

      spyOn(WalletTokenEndpoints, "authorizeApprove").and.callThrough();

      spyOn($state, "go").and.callThrough();

      spyOn(Alerts, "displayError").and.callFake(function () {});
      spyOn(Alerts, "displaySuccess").and.callFake(function () {});

    });

  });

  describe('with token', () => {
    beforeEach(() =>
      angular.mock.inject(function ($controller, $rootScope) {

        scope = $rootScope.$new();

        return $controller("AuthorizeApproveCtrl", {
          $scope: scope,
          $stateParams: {token: "token"}
        });}));

    it("should show call WalletTokenEndpoints.authorizeApprove()", inject(WalletTokenEndpoints => expect(WalletTokenEndpoints.authorizeApprove).toHaveBeenCalled())
    );

    it("should pass the token parameter along", inject(WalletTokenEndpoints => expect(WalletTokenEndpoints.authorizeApprove.calls.argsFor(0)[0]).toEqual("token"))
    );

    it("should show success", inject($state=> expect(scope.success).toBeTruthy())
    );
  });

  describe('with other browser', () => {
    beforeEach(() =>
      angular.mock.inject(function ($controller, $rootScope) {

        scope = $rootScope.$new();

        return $controller("AuthorizeApproveCtrl", {
          $scope: scope,
          $stateParams: {token: "token-other-browser"}
        });}));

    it("should not redirect", inject($state => expect($state.go).not.toHaveBeenCalled())
    );
  });

  describe('with wrong token', () => {
    beforeEach(() =>
      angular.mock.inject(function ($controller, $rootScope) {

        scope = $rootScope.$new();

        return $controller("AuthorizeApproveCtrl", {
          $scope: scope,
          $stateParams: {token: "wrong-token"}
        });}));

    it("should display an error message", inject(Alerts=> expect(Alerts.displayError).toHaveBeenCalled())
    );

    it("should redirect to the login page", inject($state=> expect($state.go).toHaveBeenCalledWith("public.login-no-uid"))
    );
  });
});
