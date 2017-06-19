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
      return expect(scope.steps[1]).toBe('info');
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

    it('should set the profile', () => {
      let info = {
        fullName: 'John Smith',
        mobile: '123456789',
        pancard: '123ABC',
        street: 'Main St',
        city: 'Bangalore',
        state: 'IN',
        zipcode: '56789',
        bankAccountNumber: '1234ABCD',
        ifsc: '98765'
      };
      scope.setProfile(info);
      expect(scope.vm.exchange.profile.fullName).toBe('John Smith');
      expect(scope.vm.exchange.profile.mobile).toBe('123456789');
      expect(scope.vm.exchange.profile.pancard).toBe('123ABC');
      expect(scope.vm.exchange.profile.address.city).toBe('Bangalore');
      expect(scope.vm.exchange.profile.address.zipcode).toBe('56789');
      expect(scope.vm.exchange.profile.bankAccountNumber).toBe('1234ABCD');
      expect(scope.vm.exchange.profile.ifsc).toBe('98765');
    });
  });
});
