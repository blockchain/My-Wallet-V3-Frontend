describe('UnocoinVerifyController', () => {
  let scope;
  let $rootScope;
  let $controller;

  beforeEach(angular.mock.module('walletApp'));

  beforeEach(() => {
    module(($provide) => {
      $provide.factory('Env', ($q) => $q.resolve({
        partners: {
          sfox: {
            states: ['NY', 'PA', 'CA']
          }
        }
      }));
    });
  });

  beforeEach(() =>
    angular.mock.inject(function ($injector, _$rootScope_, _$controller_) {
      $rootScope = _$rootScope_;
      $controller = _$controller_;
    })
  );

  let getControllerScope = function (params) {
    if (params == null) { params = {}; }
    scope = $rootScope.$new();

    scope.vm = {
      goTo () {},
      exchange: {
        profile: {
          fullName: '',
          mobile: '',
          pancard: '',
          address: {
            street: '',
            city: '',
            state: '',
            zipcode: ''
          },
          bankAccountNumber: '',
          ifsc: ''
        }
      }
    };
    $controller('UnocoinVerifyController', {
      $scope: scope
    });
    return scope;
  };

  beforeEach(function () {
    scope = getControllerScope();
    return $rootScope.$digest();
  });

  describe('steps', () => {
    it('should have address and info', () => {
      return expect(scope.steps.info).toBe(1);
    });
  });

  describe('fields', () => {
    it('should list the necessary fields', () => {
      return expect(scope.fields.length).toBe(6);
    });
  });

  describe('verifyProfile()', () => {
    it('should call goTo()', () => {
      spyOn(scope.vm, 'goTo');
      scope.verifyProfile();
      return expect(scope.vm.goTo).toHaveBeenCalled();
    });
  });

  describe('setProfile()', () => {
    beforeEach(function () {
      scope = getControllerScope();
      return $rootScope.$digest();
    });

    it('should set the address', () => {
      scope.vm.exchange.profile.address.city = 'Bangalore';
      scope.vm.exchange.profile.address.zipcode = '56789';
      expect(scope.vm.exchange.profile.address.city).toBe('Bangalore');
      expect(scope.vm.exchange.profile.address.zipcode).toBe('56789');
    });
  });
});
