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
});
