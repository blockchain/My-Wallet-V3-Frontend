describe('SfoxLinkController', () => {
  let scope;
  let Wallet;
  let $rootScope;
  let $controller;
  let $q;
  let bankAccounts;

  beforeEach(angular.mock.module('walletApp'));

  beforeEach(() =>
    angular.mock.inject(function ($injector, _$rootScope_, _$controller_, _$q_, _$timeout_) {
      $rootScope = _$rootScope_;
      $controller = _$controller_;
      $q = _$q_;

      Wallet = $injector.get('Wallet');
      let modals = $injector.get('modals');

      bankAccounts = [{
        "institution_type": "fake_institution",
        "meta": {
          "name": "Plaid Savings",
          "number": "9606"
        },
        "balance": {
          "current": 1274.93,
          "available": 1203.42
        }
      }];

      let $httpBackend = $injector.get("$httpBackend");

      return $httpBackend.expectGET('/Resources/wallet-options.json').respond({partners: {sfox: {plaid: "1"}}});
    })
  );

  let getControllerScope = function (params) {
    if (params == null) { params = {}; }
    scope = $rootScope.$new();
    scope.vm = {
      exchange: {
        profile: {},
        getBuyMethods() { return $q.resolve().then(scope.state.accounts = ['1']).finally(scope.free()); },
        bankLink: {
          getAccounts() { return $q.resolve(bankAccounts).then(scope.state.bankAccounts = bankAccounts).finally(scope.free()); },
          setAccount() { let account;
          return $q.resolve(bankAccounts).then(account = bankAccounts[0]).then(scope.vm.exchange.getBuyMethods); }
        }
      },
      goTo(state) {}
    };

    $controller("SfoxLinkController",
      {$scope: scope});
    return scope;
  };

  beforeEach(function () {
    scope = getControllerScope();
    return $rootScope.$digest();
  });

  describe('link()', function () {

    it('should call lock', () => {
      spyOn(scope, 'lock');
      scope.link();
      return expect(scope.lock).toHaveBeenCalled();
    });

    it('should get possible buy methods', () => {
      spyOn(scope.vm.exchange, 'getBuyMethods');
      scope.link();
      return expect(scope.vm.exchange.getBuyMethods).toHaveBeenCalled();
    });

    it('should set an account', () => {
      scope.link();
      return expect(scope.state.accounts).toBeDefined();
    });

    it('should call free', () => {
      spyOn(scope, 'free');
      scope.link();
      return expect(scope.free).toHaveBeenCalled();
    });
  });

  describe('verify()', function () {
    beforeEach(() =>
      scope.state.accounts = [
        {verify() { return $q.resolve().then(scope.vm.goTo('buy')).finally(scope.free); }}
      ]);

    it('should call lock', () => {
      spyOn(scope, 'lock');
      scope.verify();
      return expect(scope.lock).toHaveBeenCalled();
    });

    it('should goTo buy', () => {
      spyOn(scope.vm, 'goTo');
      scope.verify();
      return expect(scope.vm.goTo).toHaveBeenCalled();
    });

    it('should call free', () => {
      spyOn(scope, 'free');
      scope.verify();
      scope.$digest();
      return expect(scope.free).toHaveBeenCalled();
    });
  });

  describe('getBankAccounts()', function () {
    it('should get a list of bank accounts', () => {
      spyOn(scope.vm.exchange.bankLink, 'getAccounts');
      scope.getBankAccounts();
      return expect(scope.vm.exchange.bankLink.getAccounts).toHaveBeenCalled();
    });

    it('should set bank accounts', () => {
      scope.getBankAccounts();
      scope.$digest();
      return expect(scope.state.bankAccounts).toBeDefined();
    });

    it('should auto select the first bank account', () => {
      scope.getBankAccounts();
      scope.$digest();
      return expect(scope.fields.bankAccount).toBe(bankAccounts[0]);
    });
  });

  describe('setBankAccount()', function () {
    beforeEach(function () {
      scope.getBankAccounts();
      return scope.$digest();
    });

    it('should set a bank account obj', () => {
      spyOn(scope.vm.exchange.bankLink, 'setAccount');
      scope.setBankAccount();
      return expect(scope.vm.exchange.bankLink.setAccount).toHaveBeenCalled();
    });
  });

  describe('enablePlaid()', () =>
    it('should enable Plaid', () => {
      scope.enablePlaid();
      return expect(scope.state.plaid.enabled).toBe(true);
    })
  );

  describe('disablePlaid()', () =>
    it('should disable Plaid', () => {
      scope.disablePlaid();
      return expect(scope.state.plaid.enabled).toBe(undefined);
    })
  );
});
