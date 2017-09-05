describe('UnocoinCreateAccountController', () => {
  let scope;
  let $rootScope;
  let $controller;

  beforeEach(angular.mock.module('walletApp'));

  beforeEach(() =>
    angular.mock.inject(function ($injector, _$rootScope_, _$controller_, _$q_, _$timeout_, $httpBackend) {
      // TODO: use Wallet mock, so we don't need to mock this $httpBackend call
      $httpBackend.whenGET('/Resources/wallet-options.json').respond();

      $rootScope = _$rootScope_;
      $controller = _$controller_;
    })
  );

  let getControllerScope = function (params) {
    if (params == null) { params = {}; }
    scope = $rootScope.$new();
    scope.vm = {
      exchange: 'Unocoin',
      goTo: (step) => step,
      close: (skip) => skip
    };
    $controller('UnocoinCreateAccountController',
      {$scope: scope});
    return scope;
  };

  beforeEach(function () {
    scope = getControllerScope();
    return $rootScope.$digest();
  });

  describe('views', () => {
    it('should be summary and email', () => {
      expect(scope.views[0]).toBe('email');
    });
  });

  describe('.createAccount', () => {
    it('should goTo signup step if verification is still required', () => {
      spyOn(scope.vm, 'goTo');
      scope.exchange = { profile: { level: 1 } };
      scope.createAccount();
      expect(scope.vm.goTo).toHaveBeenCalledWith('verify');
    });

    it('should close the signup modal if verification is not required', () => {
      spyOn(scope.vm, 'close');
      scope.exchange = { profile: { level: 3 } };
      scope.createAccount();
      expect(scope.vm.close).toHaveBeenCalledWith(true);
    });
  });
});
