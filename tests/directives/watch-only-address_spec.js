describe('Watch Only Address Directive', () => {
  let $compile;
  let $rootScope;
  let element;
  let isoScope;
  let Wallet;

  beforeEach(module('walletApp'));

  beforeEach(inject(function (_$compile_, _$rootScope_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
  }));

  beforeEach(function () {
    element = $compile('<div watch-only-address></div>')($rootScope);
    $rootScope.$digest();
    isoScope = element.isolateScope();
    isoScope.$digest();

    isoScope.address = {};

    return angular.mock.inject(function ($injector, $rootScope, $controller) {
      let Alerts = $injector.get('Alerts');
      Wallet = $injector.get('Wallet');

      Alerts.confirm = () => ({then (f) { return f(true); }});
    });
  });

  it('should be editable', () => {
    let success = function () {};
    let error = function () {};

    spyOn(Wallet, 'changeLegacyAddressLabel').and.callThrough();
    isoScope.changeLabel('label', success, error);

    expect(Wallet.changeLegacyAddressLabel).toHaveBeenCalled();
  });

  it('should let users cancel out', () => {
    isoScope.cancelEdit();

    expect(isoScope.status.edit).toBe(false);
  });

  it('should let users delete', () => {
    spyOn(Wallet, 'deleteLegacyAddress');
    isoScope.delete();
    expect(Wallet.deleteLegacyAddress).toHaveBeenCalled();
  });
});
