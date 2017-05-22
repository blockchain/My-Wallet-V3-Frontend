describe('Public Header directive', () => {
  let $compile;
  let $rootScope;
  let element;
  let isoScope;

  beforeEach(module('walletDirectives'));
  
  beforeEach(module('walletApp'));
  // beforeEach module('walletApp')

  beforeEach(inject(function (_$compile_, _$rootScope_) {
    $compile = _$compile_;
    return $rootScope = _$rootScope_;
  })
  );

  beforeEach(function () {
    element = ($compile)('<public-header></public-header>')($rootScope);
    $rootScope.$digest();
    isoScope = element.isolateScope();
    return isoScope.$digest();
  });

  it('should have access to the rootURL', () => expect(isoScope.rootURL).toBe('https://blockchain.info/'));
});
