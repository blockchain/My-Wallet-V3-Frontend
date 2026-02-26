describe('Adverts Directive', () => {
  let element;
  let isoScope;

  beforeEach(module('walletDirectives'));

  beforeEach(function () {
    module('walletApp', function ($provide) {
      $provide.provider('Env', {
        // Injecting $q throws a weird test error
        // $get: () -> $q.resolve({apiDomain: 'https://api.blockchain.info/'})
        $get() { return {
          then(cb) { return cb({apiDomain: 'https://api.blockchain.info/'}); }
        }; }

      });
    });

    module('walletApp', function ($provide) {
      $provide.value('Adverts', {
        fetchOnce () {},
        ads: [{id: 1337}]
      });

    });



    return inject(function (_$compile_, $rootScope, Adverts) {
        spyOn(Adverts, 'fetchOnce');

        let $compile = _$compile_;

        let scope = $rootScope.$new();

        element = $compile("<adverts></adverts>")(scope);

        scope.$digest();

        isoScope = element.isolateScope();
        isoScope.$digest();

      });
  });

  it('should have text', inject(() => expect(element.html()).toContain("<button"))
  );

  it('should set baseUrl', inject(Env => expect(isoScope.baseUrl).toEqual("https://api.blockchain.info/ads/out?id="))
  );

  it('should show fetch the ads',  inject(function (Adverts) {
    expect(Adverts.fetchOnce).toHaveBeenCalled();
    expect(isoScope.ads.length).toBe(1);
  })
  );

  it('should redirect to the advertisers page, in a new tab', inject(function (Adverts) {
    Adverts.fetchOnce();
    expect(element.html()).toContain("https://api.blockchain.info/ads/out?id=1337\" target=\"_blank\" rel=\"noopener noreferrer\"");
  })
  );
});
