describe('SettingsInfoCtrl', () => {
  let scope;
  let Wallet;
  let Alerts;
  let $q;

  beforeEach(angular.mock.module('walletApp'));

  beforeEach(inject(($httpBackend) => {
    // TODO: use Wallet mock, so we don't need to mock this $httpBackend call
    $httpBackend.whenGET('/Resources/wallet-options.json').respond();
  }));

  beforeEach(() =>
    angular.mock.inject(function ($injector, $rootScope, $controller, _$q_) {
      Wallet = $injector.get('Wallet');
      Alerts = $injector.get('Alerts');
      $q = _$q_;

      Wallet.user.guid = "user_guid";
      Wallet.user.alias = "user_alias";
      Wallet.makePairingCode = function (success, error) {
        if (scope.pairingCode) { return error(); } else { return success("code"); }
      };
      Wallet.removeAlias = () => $q.resolve();

      scope = $rootScope.$new();

      $controller('SettingsInfoCtrl',
        {$scope: scope});

      return scope.$digest();
    })
  );

  describe('remove alias', () => {
    it('should ask to confirm', () => {
      spyOn(Alerts, 'confirm').and.callThrough();
      scope.removeAlias();
      expect(Alerts.confirm).toHaveBeenCalledWith(jasmine.any(String), {props: { 'UID': 'user_guid' }});
    });

    it('should remove the alias', () => {
      spyOn(Alerts, 'confirm').and.returnValue($q.resolve());
      spyOn(Wallet, 'removeAlias').and.returnValue($q.resolve());
      scope.removeAlias();
      scope.$digest();
      expect(Wallet.removeAlias).toHaveBeenCalled();
      expect(scope.loading.alias).toEqual(false);
    });
  });

  describe('pairing code', () => {
    it('should show if valid', () => {
      scope.showPairingCode();
      scope.$digest();
      expect(scope.pairingCode).toEqual("code");
      expect(scope.loading.code).toEqual(false);
    });

    it('should display an error when show failed', () => {
      spyOn(Alerts, 'displayError');
      scope.pairingCode = "code";
      scope.showPairingCode();
      scope.$digest();
      expect(Alerts.displayError).toHaveBeenCalledWith('SHOW_PAIRING_CODE_FAIL');
      expect(scope.loading.code).toEqual(false);
    });

    it('should hide', () => {
      scope.pairingCode = "code";
      scope.hidePairingCode();
      expect(scope.pairingCode).toEqual(null);
    });
  });
});
