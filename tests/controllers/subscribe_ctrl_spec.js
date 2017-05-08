describe('SubscribeCtrl', () => {
  let scope;
  let MyWallet;
  let country;

  beforeEach(angular.mock.module('walletApp'));

  beforeEach(() =>
    angular.mock.inject(function ($injector, $rootScope, $controller) {
      MyWallet = $injector.get('MyWallet');
      country = $injector.get('country');

      MyWallet.wallet = {
        accountInfo: {}
      };

      scope = $rootScope.$new();

      $controller("SubscribeCtrl", {
        $scope: scope,
        country
      }
      );

      return scope.fields = {
        email: 'p@b.com',
        countryCode: 'US'
      };}));

  it('should define email and countryCode', () => {
    expect(scope.fields.email).toBe('p@b.com');
    expect(scope.fields.countryCode).toBe('US');
  });
});
