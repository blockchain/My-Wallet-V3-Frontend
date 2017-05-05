describe "Adverts Directive", ->
  element = undefined
  isoScope = undefined
  
  beforeEach module('walletDirectives')

  beforeEach ->
    module "shared", ($provide) ->
      $provide.provider('Env', {
        # Injecting $q throws a weird test error
        # $get: () -> $q.resolve({apiDomain: 'https://api.blockchain.info/'})
        $get: () -> {
          then: (cb) -> cb({apiDomain: 'https://api.blockchain.info/'})
        }

      })
      return

    module "walletApp", ($provide) ->
      $provide.value 'Adverts',
        fetchOnce:  () ->
        ads: [{id: 1337}]

      return



    inject((_$compile_, $rootScope, Adverts) ->
        spyOn(Adverts, "fetchOnce")

        $compile = _$compile_

        scope = $rootScope.$new()

        element = $compile("<adverts></adverts>")(scope)

        scope.$digest()

        isoScope = element.isolateScope()
        isoScope.$digest()

        return
      )

  it "should have text", inject(() ->
    expect(element.html()).toContain "<button"
  )

  it "should set baseUrl", inject((Env) ->
    expect(isoScope.baseUrl).toEqual "https://api.blockchain.info/ads/out?id="
  )

  it "should show fetch the ads",  inject((Adverts) ->
    expect(Adverts.fetchOnce).toHaveBeenCalled()
    expect(isoScope.ads.length).toBe(1)
  )

  it "should redirect to the advertisers page, in a new tab", inject((Adverts) ->
    Adverts.fetchOnce()
    expect(element.html()).toContain "https://api.blockchain.info/ads/out?id=1337\" target=\"_blank\" rel=\"noopener noreferrer\""
  )
