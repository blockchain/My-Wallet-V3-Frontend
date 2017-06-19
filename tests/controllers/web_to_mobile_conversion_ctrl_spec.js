describe('MobileConversionCtrl', () => {
  let scope;
  let Wallet;
  let Alerts;
  let modalInstance = {
    close () {},
    dismiss () {}
  };

  beforeEach(angular.mock.module('walletApp'));

  beforeEach(inject(($httpBackend) => {
    // TODO: use Wallet mock, so we don't need to mock this $httpBackend call
    $httpBackend.whenGET('/Resources/wallet-options.json').respond();
  }));

  beforeEach(() =>
    angular.mock.inject(function ($injector, $rootScope, $controller) {
      Wallet = $injector.get('Wallet');
      Alerts = $injector.get('Alerts');

      Wallet.makePairingCode = function (success, error) {
        if (scope.pairingCode) { return error(); } else { return success('pairingCode'); }
      };

      scope = $rootScope.$new();

      $controller('MobileConversionCtrl', {
        $scope: scope,
        $uibModalInstance: modalInstance
      });

      return scope.$digest();
    })
  );

  describe('makeQR()', () => {
    it('should create a QR code', () => {
      scope.makeQR();
      scope.$digest();
      expect(scope.pairingCode).toEqual('pairingCode');
    });

    it('should display an error when show failed', () => {
      spyOn(Alerts, 'displayError');
      scope.pairingCode = 'pairingCode';
      scope.makeQR();
      scope.$digest();
      expect(Alerts.displayError).toHaveBeenCalledWith('SHOW_PAIRING_CODE_FAIL');
    });
  });
});
