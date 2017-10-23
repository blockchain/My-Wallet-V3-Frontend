describe('CoinifySignupComponentController', () => {
  let $rootScope;
  $rootScope = undefined;
  let $compile;
  let $templateCache;
  let $componentController;
  let scope;
  let Wallet;

  let bindings = {
    email: 'test@example.com',
    validEmail: true,
    onClose: jasmine.createSpy('onClose'),
    onError: jasmine.createSpy('onError'),
    onComplete: jasmine.createSpy('onComplete'),
    onEmailChange: jasmine.createSpy('onEmailChange'),
    fiatCurrency () { return 'USD'; }
  };

  let getController = function (bindings) {
    scope = $rootScope.$new();
    let ctrl = $componentController('coinifySignup', {$scope: scope}, bindings);
    let template = $templateCache.get('partials/coinify/signup.pug');
    $compile(template)(scope);
    return ctrl;
  };

  beforeEach(angular.mock.module('walletApp'));

  beforeEach(() =>
    angular.mock.inject(function ($injector, _$rootScope_, _$componentController_, _$q_, _$timeout_, _$compile_, _$templateCache_, $httpBackend) {
      // TODO: use Wallet mock, so we don't need to mock this $httpBackend call
      $httpBackend.whenGET('/Resources/wallet-options.json').respond();

      $rootScope = _$rootScope_;
      $compile = _$compile_;
      $templateCache = _$templateCache_;
      $componentController = _$componentController_;
      let $q = _$q_;

      Wallet = $injector.get('Wallet');
      Wallet.goal = {};
      Wallet.changeEmail = (email, succ, err) => succ();
      Wallet.resendEmailConfirmation = () => $q.resolve();

      MyWallet = $injector.get('MyWallet');
      coinify = $injector.get('coinify');

      MyWallet.wallet = {
        external: {
          coinify: {}
        }
      };

      MyWallet.wallet.external.coinify.signup = (ctrl) => {
        if (ctrl.validEmail) {
          return $q.resolve();
        } else {
          return $q.reject({error: 'EMAIL_ADDRESS_IN_USE'});
        }
      };
    })
  );

  describe('.signup()', function () {
    let ctrl;
    beforeEach(() => ctrl = getController(bindings));

    it('should perform signup', () => {
      ctrl.validEmail = true;
      MyWallet.wallet.external.coinify.signup(ctrl).then(() => {
        expect(ctrl.onComplete).toHaveBeenCalled();
        $rootScope.$digest();
      });
    });

    it('should handle signup errors', () => {
      ctrl.validEmail = false;
      MyWallet.wallet.external.coinify.signup(ctrl).then(() => {
        expect(ctrl.onEmailChange).toHaveBeenCalled();
        $rootScope.$digest(); });
    });
  });
});
