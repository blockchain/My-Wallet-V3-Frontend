describe('SfoxSignupController', () => {
  let $controller;
  let options;
  let $rootScope;

  let profile = (status, docs) => ({verificationStatus: { level: status, required_docs: docs }});
  let accounts = function (first) { if (first) { return [first]; } else { return []; } };

  beforeEach(angular.mock.module('walletApp'));

  beforeEach(() =>
    angular.mock.inject(function ($injector, $q, _$rootScope_, _$controller_) {
      $rootScope = _$rootScope_;
      $controller = _$controller_;

      options = {
        partners: {
          sfox: {
            surveyLinks: []
          }
        }
      };
    }));

  let getController = (profile, accounts, quote) =>
    $controller('SfoxSignupController', {
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

    it('should have goTo correctly implemented', () => {
      ctrl.goTo('buy');
      return expect(ctrl.step).toEqual(ctrl.steps['buy']);
    });

    it('should have onStep correctly implemented', () => {
      ctrl.goTo('buy');
      return expect(ctrl.onStep('buy')).toEqual(true);
    });
  });

  describe('initial step', function () {
    it('should be \'create\' when there is no profile', () => {
      let ctrl = getController();
      return expect(ctrl.onStep('create')).toEqual(true);
    });

    it('should be \'verify\' if profile is unverified', () => {
      let ctrl = getController(profile('unverified'));
      return expect(ctrl.onStep('verify')).toEqual(true);
    });

    it('should be \'verify\' if profile is pending verification and needs docs', () => {
      let ctrl = getController(profile('pending', ['id']));
      return expect(ctrl.onStep('verify')).toEqual(true);
    });

    it('should be \'link\' if profile is pending verification and does not need docs', () => {
      let ctrl = getController(profile('pending'));
      return expect(ctrl.onStep('link')).toEqual(true);
    });

    it('should be \'link\' if user does not have an account', () => {
      let ctrl = getController(profile('verified'), accounts());
      return expect(ctrl.onStep('link')).toEqual(true);
    });

    it('should be \'link\' if user does not have an active account', () => {
      let ctrl = getController(profile('verified'), accounts({status: 'pending'}));
      return expect(ctrl.onStep('link')).toEqual(true);
    });

    it('should be \'buy\' if user is verified and has account', () => {
      let ctrl = getController(profile('verified'), accounts({status: 'active'}));
      return expect(ctrl.onStep('buy')).toEqual(true);
    });
  });
});
