describe('VerifyEmailController', () => {
  let scope;
  let $rootScope;
  let $controller;

  beforeEach(angular.mock.module('walletApp'));

  beforeEach(() =>
    angular.mock.inject(function ($injector, $q, _$rootScope_, _$controller_) {
      $rootScope = _$rootScope_;
      $controller = _$controller_;

      let WalletTokenEndpoints = $injector.get('WalletTokenEndpoints');

      return spyOn(WalletTokenEndpoints, "verifyEmail").and.callFake(function (token) {
        if (token === "token") { return $q.resolve(); } else { return $q.reject({ error: "error_msg" }); }
      });
    })
  );

  let getControllerScope = function (token) {
    scope = $rootScope.$new();
    $controller("VerifyEmailCtrl", {
      $scope: scope,
      $stateParams: {token}
    });
    return scope;
  };

  describe('with token', () => {
    beforeEach(() => scope = getControllerScope("token"));

    it("should call WalletTokenEndpoints.verifyEmail()", inject(WalletTokenEndpoints => expect(WalletTokenEndpoints.verifyEmail).toHaveBeenCalledWith("token"))
    );

    it('should set the state to success', () => {
      scope.$digest();
      expect(scope.state).toEqual("success");
    });
  });

  describe('with wrong token', () => {
    beforeEach(() => scope = getControllerScope("wrong-token"));

    it('should set the state to error', () => {
      scope.$digest();
      expect(scope.state).toEqual("error");
    });

    it('should set the error value on the scope', () => {
      scope.$digest();
      expect(scope.error).toEqual("error_msg");
    });
  });
});
