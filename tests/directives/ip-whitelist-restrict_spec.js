describe('IP Whitelist Restrict', () => {
  let $compile;
  let $rootScope;
  let element;
  let isoScope;

  beforeEach(module('walletDirectives'));
  
  beforeEach(module('walletApp'));

  beforeEach(() => {
    module(($provide) => {
      $provide.value('Wallet', {
        settings: {},
        enableRestrictToWhiteListedIPs: () => {},
        disableRestrictToWhiteListedIPs: () => {}
      });
    });
  });

  beforeEach(inject(function (_$compile_, _$rootScope_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
  }));

  beforeEach(function () {
    element = $compile('<ip-whitelist-restrict></ip-whitelist-restrict>')($rootScope);
    $rootScope.$digest();
    isoScope = element.isolateScope();
    return isoScope.$digest();
  });

  it('should have wallet settings', inject(function (Wallet) {
    expect(isoScope.settings).toBe(Wallet.settings);
  }));

  it('should enable ip whitelist restrictions', inject(function (Wallet) {
    spyOn(Wallet, 'enableRestrictToWhiteListedIPs');
    isoScope.enableIpWhitelistRestrict();
    expect(Wallet.enableRestrictToWhiteListedIPs).toHaveBeenCalled();
  }));

  it('should disable ip whitelist restrictions', inject(function (Wallet) {
    spyOn(Wallet, 'disableRestrictToWhiteListedIPs');
    isoScope.disableIpWhitelistRestrict();
    expect(Wallet.disableRestrictToWhiteListedIPs).toHaveBeenCalled();
  }));
});
