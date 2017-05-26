describe('SfoxCreateAccountController', () => {
  let scope;
  let Wallet;
  let $rootScope;
  let $controller;
  let $q;

  beforeEach(angular.mock.module('walletApp'));

  beforeEach(() =>
    angular.mock.inject(function ($injector, _$rootScope_, _$controller_, _$q_, _$timeout_, $httpBackend) {
      // TODO: use Wallet mock, so we don't need to mock this $httpBackend call
      $httpBackend.whenGET('/Resources/wallet-options.json').respond();

      $rootScope = _$rootScope_;
      $controller = _$controller_;
      $q = _$q_;

      Wallet = $injector.get('Wallet');

      Wallet.user = {
        email: 'sn@blockchain.com',
        mobileNumber: '123-456-7891'
      };

      Wallet.changeEmail = () => $q.resolve();
      Wallet.verifyEmail = () => $q.resolve();
      Wallet.changeMobile = () => $q.resolve();
      return Wallet.verifyMobile = () => $q.resolve();
    })
  );

  let getControllerScope = function (params) {
    if (params == null) { params = {}; }
    scope = $rootScope.$new();
    scope.$$childHead = scope.$new();
    scope.$$childHead.accountForm =
      {email: {$setValidity() {}}};
    scope.$$childHead.emailForm =
      {emailCode: {$setValidity() {}}};
    scope.$$childHead.mobileForm =
      {mobileCode: {$setValidity() {}}};
    scope.vm = {exchange: 'SFOX'};
    $controller("SfoxCreateAccountController",
      {$scope: scope});
    return scope;
  };

  beforeEach(function () {
    scope = getControllerScope();
    return $rootScope.$digest();
  });

  describe('state', () => {

    it('should set terms to false', () => expect(scope.state.terms).toBe(false));

    describe('lock and free', () =>

      it('should toggle the busy state', () => {
        scope.lock();
        expect(scope.locked).toBe(true);
        scope.free();
        return expect(scope.locked).toBe(false);
      })
    );
  });

  describe('setState', () =>

    it('should match the user\'s preferences', () => {
      expect(scope.state.email).toBe('sn@blockchain.com');
      expect(scope.state.mobile).toBe('123-456-7891');
      expect(scope.state.isEmailVerified).toBe(undefined);
      return expect(scope.state.isMobileVerified).toBe(undefined);
    })
  );

  describe('changeEmail', () => {

    it('should call lock', () => {
      spyOn(scope, 'lock');
      scope.changeEmail();
      return expect(scope.lock).toHaveBeenCalled();
    });

    it('should change the users email address', () => {
      spyOn(Wallet, 'changeEmail');
      scope.changeEmail();
      return expect(Wallet.changeEmail).toHaveBeenCalled();
    });
  });

  describe('changeMobile', () =>

    it('should change the mobile number', () => {
      spyOn(Wallet, 'changeMobile');
      scope.changeMobile();
      return expect(Wallet.changeMobile).toHaveBeenCalled();
    })
  );

  describe('verifyMobile', () =>

    it('should verify the mobile number', () => {
      spyOn(Wallet, 'verifyMobile');
      scope.verifyMobile();
      return expect(Wallet.verifyMobile).toHaveBeenCalled();
    })
  );
});
