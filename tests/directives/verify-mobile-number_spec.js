describe('Verify Mobile Number Directive', () => {
  let $compile;
  let $rootScope;
  let element;
  let isoScope;
  let Wallet;

  beforeEach(module('walletApp'));

  beforeEach(inject(function (_$compile_, _$rootScope_, $injector) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    Wallet = $injector.get('Wallet');

    Wallet.verifyMobile = function (code, success, error) {
      if (code) {
        return success();
      } else {
        return error('error');
      }
    };

    Wallet.changeMobile = function (mobile, success, error) {
      if (mobile) {
        return success();
      } else {
        return error('error');
      }
    };
  })
  );

  beforeEach(function () {
    element = $compile('<verify-mobile-number button-lg full-width></verify-mobile-number>')($rootScope);
    $rootScope.$digest();
    isoScope = element.isolateScope();
    isoScope.$digest();

    isoScope.onSuccess = () => true;
  });

  it('should have text', () => {
    expect(element.html()).toContain('VERIFY');
  });

  describe('verifyMobile', () => {
    it('can be verified', () => {
      spyOn(isoScope, 'onSuccess');
      isoScope.verifyMobile('31 1 2345');
      expect(isoScope.onSuccess).toHaveBeenCalled();
    });

    it('can not be verified if no code is passed', () => {
      isoScope.verifyMobile();
      expect(isoScope.errors.verify).toBe('error');
    });
  });

  describe('retrySendCode', () => {
    it('should get an error if retry fails', () => {
      isoScope.retrySendCode();
      expect(isoScope.errors.retryFail).toBeDefined();
    });

    it('should call successful retry to send', () => {
      Wallet.user.mobileNumber = '639';
      spyOn(isoScope, 'onSuccess');
      isoScope.retrySendCode();
      expect(isoScope.errors.retryFail).toBe(null);
    });
  });
});
