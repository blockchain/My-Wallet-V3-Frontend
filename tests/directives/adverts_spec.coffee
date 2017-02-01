describe "Adverts Directive", ->
  $compile = undefined
  rootScope = undefined
  element = undefined
  isoScope = undefined

  beforeEach ->
    module "walletApp", ($provide) ->
      $provide.value 'Adverts',
        fetchOnce:  () ->
        ads: [{id: 1337}]
      return

    inject((_$compile_, $rootScope, Adverts) ->
        spyOn(Adverts, "fetchOnce")

        rootScope = $rootScope;

        $compile = _$compile_

        scope = $rootScope.$new()
        $rootScope.apiDomain = "https://api.blockchain.info/"

        element = $compile("<adverts></adverts>")(scope)

        scope.$digest()

        isoScope = element.isolateScope()
        isoScope.$digest()

        return
      )

  it "should have text", inject(() ->
    expect(element.html()).toContain "<button"
  )

  it "should show fetch the ads",  inject((Adverts) ->
    expect(Adverts.fetchOnce).toHaveBeenCalled()
    expect(isoScope.ads.length).toBe(1)
  )

  it "should redirect to the advertisers page, in a new tab", inject((Adverts) ->
    Adverts.fetchOnce()
    expect(element.html()).toContain "<a ng-href=\"https://api.blockchain.info/ads/out?id=1337\" target=\"_blank\" rel=\"noopener noreferrer\""
  )
