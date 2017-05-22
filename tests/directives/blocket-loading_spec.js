describe('Blocket loading directive', () => {
  let $compile;
  let $rootScope;
  let element;
  let isoScope;

  beforeEach(module('walletDirectives'));
  
  beforeEach(module('walletApp'));

  beforeEach(inject(function (_$compile_, _$rootScope_, Wallet) {
    $compile = _$compile_;
    return $rootScope = _$rootScope_;
  })
  );

  beforeEach(function () {
    element = $compile('<blocket-loading></blocket-loading')($rootScope);
    $rootScope.$digest();
    isoScope = element.isolateScope();
    return isoScope.$digest();
  });

  it('should engage liftoff', inject(function ($timeout) {
    isoScope.launch();
    $timeout.flush();
    expect(isoScope.liftoff).toBe(true);
    expect(isoScope.orbiting).toBe(true);
  })
  );
});
