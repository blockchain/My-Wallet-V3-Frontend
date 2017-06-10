describe('Public Header directive', () => {
  let $compile;
  let $rootScope;
  let element;
  let isoScope;

  beforeEach(module('walletDirectives'));
  
  beforeEach(module('walletApp'));

  beforeEach(() => {
    module(($provide) => {
      $provide.factory('Env', ($q) => $q.resolve({
        rootURL: 'https://blockchain.info/'
      }));
    });
  });

  beforeEach(inject(function (_$compile_, _$rootScope_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
  })
  );

  beforeEach(function () {
    element = ($compile)('<public-header></public-header>')($rootScope);
    $rootScope.$digest();
    isoScope = element.isolateScope();
    isoScope.$digest();
  });

  it('should have access to the rootURL', () => {
    expect(isoScope.rootURL).toBe('https://blockchain.info/');
  });
});
