describe('SfoxSignupController', () => {
  let $controller;
  let $rootScope;
  let MyWallet;
  let sfox;

  let profile = (status, docs) => ({verificationStatus: { level: status, required_docs: docs || [] }});
  let accounts = function (first) { if (first) { return [first]; } else { return []; } };

  beforeEach(angular.mock.module('walletApp'));

  beforeEach(() =>
    angular.mock.inject(function ($injector, $q, _$rootScope_, _$controller_) {
      $rootScope = _$rootScope_;
      $controller = _$controller_;
      MyWallet = $injector.get('MyWallet');
      sfox = $injector.get('sfox');
    }));

  let getController = (profile, accounts) => {
      MyWallet.wallet.external = {
        sfox: {
          profile: profile
        }
      }
    
      return $controller('SfoxSignupController', {
        $uibModalInstance: { close: (function () {})({dismiss () {}}) },
        exchange: { profile },
        accounts: accounts || []
      })
    ;
  }

  describe('steps', () => {
    let ctrl;
    beforeEach(() => ctrl = getController());

    it('should have goTo correctly implemented', () => {
      ctrl.goTo('link');
      return expect(ctrl.step).toEqual(ctrl.steps['link']);
    });

    it('should have onStep correctly implemented', () => {
      ctrl.goTo('link');
      return expect(ctrl.onStep('link')).toEqual(true);
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
      return expect(ctrl.onStep('upload')).toEqual(true);
    });

    it('should be \'link\' if profile is pending verification and does not need docs', () => {
      let ctrl = getController(profile('pending', []));
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
  });
});
