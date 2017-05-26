describe('OpenLinkController', () => {
  let scope;

  beforeEach(angular.mock.module('walletApp'));

  beforeEach(() => {
    angular.mock.inject(($httpBackend) => {
      // TODO: use Wallet mock, so we don't need to mock this $httpBackend call
      $httpBackend.whenGET('/Resources/wallet-options.json').respond();
    });
  });

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
