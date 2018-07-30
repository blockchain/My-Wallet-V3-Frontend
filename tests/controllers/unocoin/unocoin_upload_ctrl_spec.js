describe('UnocoinUploadController', () => {
  let scope;
  let Upload;
  let $rootScope;
  let $controller;
  let $q;
  let bankAccounts;

  let profile = {
    addPhoto () { return $q.resolve(); }
  };

  Upload = {
    base64DataUrl () {
      return $q.resolve().then(profile.addPhoto().then(scope.setState()));
    }
  };

  beforeEach(angular.mock.module('walletApp'));

  beforeEach(() =>
    angular.mock.inject(function ($injector, _$rootScope_, _$controller_, _$q_, _$timeout_, $httpBackend) {
      $httpBackend.whenGET('/Resources/wallet-options.json').respond();

      $rootScope = _$rootScope_;
      $controller = _$controller_;
      $q = _$q_;

      Upload = $injector.get('Upload');
    })
  );

  let getControllerScope = function (params) {
    if (params == null) { params = {}; }
    scope = $rootScope.$new();
    scope.vm = {
      exchange: {
        profile: {
          addPhoto () { return $q.resolve().then(scope.setState()); },
          verify () { return $q.resolve(); }
        },
        getBuyMethods () { return $q.resolve().then(scope.state.accounts = ['1']).finally(scope.free()); },
        bankLink: {
          getAccounts () { return $q.resolve(bankAccounts).then(scope.state.bankAccounts = bankAccounts).finally(scope.free()); },
          setAccount () { let account;
          return $q.resolve(bankAccounts).then(account = bankAccounts[0]).then(scope.vm.exchange.getBuyMethods); }
        }
      },
      goTo(state) {}
    };

    $controller("UnocoinUploadController",
      {$scope: scope});
    return scope;
  };

  beforeEach(function () {
    scope = getControllerScope();
    return $rootScope.$digest();
  });

  describe('setState()', function () {
    it('should set state.idType', () => {
      scope.setState();
      expect(scope.state.idType).toBe('photo');
    });
  });

  describe('prepUpload()', function () {
    it('should call Upload', () => {
      spyOn(Upload, 'base64DataUrl');
      spyOn(profile, 'addPhoto');
      scope.prepUpload();
      expect(Upload.base64DataUrl).toHaveBeenCalled();
      // expect(profile.addPhoto).toHaveBeenCalled();
    });
  });

  describe('verify()', function () {
    it('should call lock()', () => {
      spyOn(scope, 'lock');
      scope.verify();
      return expect(scope.lock).toHaveBeenCalled();
    });
  });

  describe('goTo()', function () {
    it('should set state.step', () => {
      scope.goTo('verify');
      expect(scope.state.step).toBe('verify');
    });
  });
});
