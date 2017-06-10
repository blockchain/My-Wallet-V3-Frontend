describe('Resend Email Confirmation', () => {
  let $compile;
  let $rootScope;
  let element;
  let isoScope;

  beforeEach(module('walletDirectives'));
  
  beforeEach(module('walletApp'));

  beforeEach(() => {
    module(($provide) => {
      $provide.value('Wallet', {
        resendEmailConfirmation: () => {}
      });
    });
  });

  beforeEach(inject(function (_$compile_, _$rootScope_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
  }));

  beforeEach(() => {
    element = $compile('<resend-email-confirmation></resend-email-confirmation>')($rootScope);
    $rootScope.$digest();
    isoScope = element.isolateScope();
    isoScope.$digest();
  });

  it('should have wallet user', inject(Wallet => {
    expect(isoScope.user).toBe(Wallet.user);
  }));

  it('should resend email confirmation', inject(Wallet => {
    spyOn(Wallet, 'resendEmailConfirmation');
    isoScope.resendEmailConfirmation();
    expect(Wallet.resendEmailConfirmation).toHaveBeenCalled();
  }));
});
