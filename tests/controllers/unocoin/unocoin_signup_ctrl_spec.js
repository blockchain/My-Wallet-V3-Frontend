describe('UnocoinSignupController', () => {
  let $controller;
  let $q;
  let options;
  let Alerts;

  beforeEach(angular.mock.module('walletApp'));

  beforeEach(() =>
    angular.mock.inject(function ($injector, _$q_, _$rootScope_, _$controller_, $httpBackend) {
      $controller = _$controller_;
      $q = _$q_;
      Alerts = $injector.get('Alerts');
      MyWallet = $injector.get('MyWallet');

      options = {
        partners: {
          unocoin: { surveyLinks: [] }
        }
      };

      MyWallet.wallet = {
        external: {
          unocoin: {}
        }
      };
    }));

  let getController = (profile, accounts, quote) =>
    $controller('UnocoinSignupController', {
      $uibModalInstance: { dismiss: () => $q.resolve() },
      exchange: { profile },
      quote: quote || {},
      options: options || {},
      accounts: accounts || []
    })
  ;

  describe('steps', () => {
    let ctrl;
    beforeEach(() => ctrl = getController());

    it('should have onOrAfterStep correct', () => {
      ctrl.goTo('upload');
      expect(ctrl.onOrAfterStep('create')).toBe(true);
    });

    it('should check onStep when calling onOrAfterStep', () => {
      ctrl.goTo('verify');
      expect(ctrl.onOrAfterStep('verify')).toBe(true);
    });

    it('should have onStep correct', () => {
      ctrl.goTo('upload');
      expect(ctrl.onStep('upload')).toBe(true);
    });
  });
});
