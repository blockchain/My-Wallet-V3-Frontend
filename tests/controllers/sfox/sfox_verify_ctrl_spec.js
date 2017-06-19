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
          verify() { return $q.resolve.then(); },
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

  beforeEach(() =>
    scope.state = {
      file: {
        name: 'test-passport.jpg'
      },
      signedURL: 'sfox.com/signed'
    }
  );
});
