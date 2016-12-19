describe "Adverts Directive", ->
  $compile = undefined
  $rootScope = undefined
  element = undefined
  isoScope = undefined

  beforeEach ->
    module "walletApp", ($provide) ->
      $provide.value 'Adverts',
        fetchOnce:  () ->
        ads: [{url: "http://www.google.com/"}]
      return

    inject((_$compile_, _$rootScope_, Adverts) ->
        spyOn(Adverts, "fetchOnce")

        $compile = _$compile_
        $rootScope = _$rootScope_

        element = $compile("<adverts></adverts>")($rootScope)

        $rootScope.$digest()
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

  it "should redirect to the advertisers page, in a new tab", inject((Adverts, $window) ->
    spyOn($window, "open")
    isoScope.visit(Adverts.ads[0])
    expect($window.open).toHaveBeenCalledWith("http://www.google.com/", "_blank")
  )
