describe('TOR Directive', () => {
  let $compile;
  let $rootScope;
  let element;
  let isoScope;

  beforeEach(module('walletApp'));

  beforeEach(inject(function (_$compile_, _$rootScope_, Wallet) {

    $compile = _$compile_;
    $rootScope = _$rootScope_;

    Wallet.settings_api = {
      updateTorIpBlock(value, success, error) {
        return success();
      }
    };

  })
  );

  beforeEach(function () {
    element = $compile("<tor></tor>")($rootScope);
    $rootScope.$digest();
    isoScope = element.isolateScope();
    return isoScope.$digest();
  });

  it('should have text', () => {
    expect(element.html()).toContain("BLOCK_TOR");

    it("has an initial status", () => expect(isoScope.settings.blockTOR).toBe(false));

    it("can be enabled", inject(function (Wallet) {
      spyOn(Wallet, 'enableBlockTOR').and.callThrough();
      isoScope.enableBlockTOR();
      expect(Wallet.enableBlockTOR).toHaveBeenCalled();
      expect(isoScope.settings.blockTOR).toBe(true);
    })
    );

    it("can be disabled", inject(function (Wallet) {
      spyOn(Wallet, 'disableBlockTOR');
      isoScope.disableBlockTOR();
      expect(Wallet.disableBlockTOR).toHaveBeenCalled();
    })
    );
  });
});
