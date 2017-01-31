describe "Adverts Directive", ->
  $compile = undefined
  rootScope = undefined
  element = undefined
  isoScope = undefined

  beforeEach ->
    module "walletApp", ($provide) ->
      $provide.value 'Adverts',
        fetchOnce:  () ->
        ads: [{link: "http://www.google.com/"}]
      return

    inject((_$compile_, $rootScope, Adverts) ->
        spyOn(Adverts, "fetchOnce")

        rootScope = $rootScope;

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

  it "should show fetch the ads",  inject((Adverts) ->
    expect(Adverts.fetchOnce).toHaveBeenCalled()
    expect(isoScope.ads.length).toBe(1)
  )

  it "should redirect to the advertisers page, in a new tab", inject((Adverts) ->
    spyOn(rootScope, "safeWindowOpen")
    isoScope.visit(Adverts.ads[0])
    expect(rootScope.safeWindowOpen).toHaveBeenCalledWith("http://www.google.com/")
  )
