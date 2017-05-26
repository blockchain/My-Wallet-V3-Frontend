describe('Watch Only Address Directive', () => {
  let $compile;
  let $rootScope;
  let element;
  let isoScope;
  let Wallet;

  beforeEach(module('walletDirectives'));
  
  beforeEach(module('walletApp'));

  beforeEach(inject(function (_$compile_, _$rootScope_, $httpBackend) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    // TODO: use Wallet mock, so we don't need to mock this $httpBackend call
    $httpBackend.whenGET('/Resources/wallet-options.json').respond();
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
