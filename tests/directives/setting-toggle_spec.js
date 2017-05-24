describe('Setting Toggle', () => {
  let $compile;
  let $rootScope;
  let element;
  let isoScope;

  beforeEach(module('walletApp'));

  beforeEach(inject(function (_$compile_, _$rootScope_, Wallet) {

    $compile = _$compile_;
    $rootScope = _$rootScope_;

  })
  );

  beforeEach(function () {
    element = $compile("<setting-toggle></setting-toggle>")($rootScope);
    $rootScope.$digest();
    isoScope = element.isolateScope();
    return isoScope.$digest();
  });

  it('should toggle', () => {
    pending();
  });
});
