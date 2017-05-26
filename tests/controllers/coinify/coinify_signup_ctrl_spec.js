describe('CoinifySignupComponentController', () => {
  let ctrlName = "coinifySignup";
  let ctrl;
  let bindings;
  let Wallet;
  let $rootScope;
  let $componentController;
  let buySell;

  let func = jasmine.any(Function);

  beforeEach(angular.mock.module('walletApp'));

  beforeEach(() => {
    angular.mock.inject(($httpBackend) => {
      // TODO: use Wallet mock, so we don't need to mock this $httpBackend call
      $httpBackend.whenGET('/Resources/wallet-options.json').respond();
    });
  });

  beforeEach(() =>
    angular.mock.inject(function ($injector, _$rootScope_, _$componentController_, _$q_, _$timeout_) {
      $rootScope = _$rootScope_;
      $componentController = _$componentController_;
      let $q = _$q_;

      bindings = {
        email: "test@example.com",
        validEmail: true,
        onClose: jasmine.createSpy('onClose'),
        onError: jasmine.createSpy('onError'),
        onComplete: jasmine.createSpy('onComplete'),
        onEmailChange: jasmine.createSpy('onEmailChange'),
        fiatCurrency() { return 'USD'; }
      };

      Wallet = $injector.get('Wallet');
      Wallet.goal = {};
      Wallet.changeEmail = (email, succ, err) => succ();
      Wallet.resendEmailConfirmation = () => $q.resolve();

      buySell = $injector.get('buySell');
      return buySell.getExchange = () => ({
        signup() { if (ctrl.validEmail) { return $q.resolve(); } else { return $q.reject({error: 'EMAIL_ADDRESS_IN_USE'}); } }
      }) ;}));

  describe('.signup()', function () {
    beforeEach(() => ctrl = $componentController(ctrlName, null, bindings));

    it('should perform signup', () => {
      ctrl.validEmail = true;
      ctrl.signup();
      $rootScope.$digest();
      return expect(ctrl.onComplete).toHaveBeenCalled();
    });

    it('should handle signup errors', () => {
      ctrl.validEmail = false;
      ctrl.signup();
      $rootScope.$digest();
      return expect(ctrl.onEmailChange).toHaveBeenCalled();
    });
  });
});
