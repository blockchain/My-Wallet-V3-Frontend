describe('Resend Email Confirmation', () => {
  let $compile;
  let $rootScope;
  let element;
  let isoScope;

  beforeEach(module('walletDirectives'));
  
  beforeEach(module('walletApp'));

  beforeEach(inject(function (_$compile_, _$rootScope_, Wallet) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
  }));

  beforeEach(function () {
    element = $compile('<resend-email-confirmation></resend-email-confirmation>')($rootScope);
    $rootScope.$digest();
    isoScope = element.isolateScope();
    return isoScope.$digest();
  });

  it('should have wallet user', inject(function (Wallet) {
    expect(isoScope.user).toBe(Wallet.user);
  }));

  it('should resend email confirmation', inject(function (Wallet) {
    spyOn(Wallet, 'resendEmailConfirmation');
    isoScope.resendEmailConfirmation();
    expect(Wallet.resendEmailConfirmation).toHaveBeenCalled();
  }));
});
