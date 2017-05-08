describe('OpenLinkController', () => {
  let scope;

  beforeEach(angular.mock.module('walletApp'));

  beforeEach(function () {
    angular.mock.inject(function ($injector, $rootScope, $controller) {
      let Wallet = $injector.get('Wallet');
      let MyWallet = $injector.get('MyWallet');

      Wallet.parsePaymentRequest = function (url) {};

      scope = $rootScope.$new();

      $controller('OpenLinkController', {
        $scope: scope,
        $stateParams: {}
      });

      scope.$digest();

    });

  });

  it('should have access to Wallet', () => expect(Wallet).toBeDefined());
});