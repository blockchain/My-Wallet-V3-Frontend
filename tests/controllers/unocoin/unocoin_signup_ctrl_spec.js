describe('UnocoinSignupController', () => {
  let $controller;
  let options;
  let $rootScope;
  let Alerts

  beforeEach(angular.mock.module('walletApp'));

  beforeEach(() =>
    angular.mock.inject(function ($injector, $q, _$rootScope_, _$controller_) {
      $rootScope = _$rootScope_;
      $controller = _$controller_;
      Alerts = $injector.get('Alerts');

      options = {
        partners: {
          sfox: {
            surveyLinks: []
          }
        }
      };
    }));

  let getController = (profile, accounts, quote) =>
    $controller('UnocoinSignupController', {
      $uibModalInstance: { close: (function () {})({dismiss () {}}) },
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
