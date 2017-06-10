describe('SfoxVerifyController', () => {
  let scope;
  let Wallet;
  let Options;
  let $rootScope;
  let $controller;
  let $q;

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
    angular.mock.inject(function ($injector, _$rootScope_, _$controller_, _$q_, _$timeout_) {
      $rootScope = _$rootScope_;
      $controller = _$controller_;
      $q = _$q_;

      let Upload = $injector.get('Upload');
    })
  );

  let getControllerScope = function (params) {
    if (params == null) { params = {}; }
    scope = $rootScope.$new();
    scope.vm = {
      goTo() {},
      exchange: {
        profile: {
          setSSN() {},
          setAddress() {},
          verify() { return $q.resolve.then(scope.setState); },
          getSignedURL() { return $q.resolve('www.signedurl.com').then().finally(scope.free()); },
          firstName: 'phil',
          middleName: 'n',
          lastName: 'london',
          dateOfBirth: '05/14/1991',
          identity: {
            number: 1
          },
          address: {
            street: {
              line1: '140',
              line2: '2C'
            },
            city: 'NYC',
            state: 'New York',
            zipcode: '10023'
          },
          verificationStatus: {
            level: 'unverified',
            required_docs: ['ssn', 'id', 'address']
          }
        }
      }
    };

    $controller("SfoxVerifyController", {
      $scope: scope,
      Options
    }
    );
    return scope;
  };

  beforeEach(function () {
    scope = getControllerScope();
    return $rootScope.$digest();
  });

  describe('setState', () => {

    it('should set verificationStatus', () => {
      scope.setState();
      return expect(scope.state.verificationStatus).toBeDefined();
    });

    it('should set idType to the first idTypes', () => {
      let idTypes = ['ssn', 'id', 'address'];
      scope.setState();
      return expect(scope.state.idType).toBe('ssn');
    });
  });

  beforeEach(() =>
    scope.state = {
      file: {
        name: 'test-passport.jpg'
      },
      signedURL: 'sfox.com/signed'
    }
  );

  describe('isBeforeNow', () => {
    beforeEach(function () {
      let mockNow = new Date("11/24/2016").getTime();
      return spyOn(Date, "now").and.returnValue(mockNow);
    });

    it('should return true if date is in past', () => {
      let past = "11/23/2016";
      return expect(scope.isBeforeNow(past)).toEqual(true);
    });

    it('should return false if date is in future', () => {
      let future = "11/25/2016";
      return expect(scope.isBeforeNow(future)).toEqual(false);
    });
  });

  describe('prepUpload', () =>

    it('should get a signed url', () => {
      spyOn(scope.vm.exchange.profile, 'getSignedURL');
      scope.prepUpload();
      return expect(scope.vm.exchange.profile.getSignedURL).toHaveBeenCalled();
    })
  );

  describe('verify', () => {
    beforeEach(() =>
      scope.state.state =
        {'Code': 'NY'}
    );

    it('should verify a users identity', () => {
      spyOn(scope, 'setState');
      spyOn(scope.vm.exchange.profile, 'verify');
      scope.verify();
      scope.$digest();
      expect(scope.vm.exchange.profile.verify).toHaveBeenCalled();
      return expect(scope.setState).toHaveBeenCalled();
    });

    it('should call free if verification fails', () => {
      spyOn(scope, 'free');
      scope.vm.exchange.profile = null;
      scope.verify();
      return expect(scope.free).toHaveBeenCalled();
    });
  });
});
