describe "browserDetection", ->
  $compile = undefined
  $rootScope = undefined
  element = undefined
  isoScope = undefined
  MyWallet = undefined

  beforeEach module('walletDirectives');
  beforeEach module("walletApp")

  beforeEach inject((_$compile_, _$rootScope_) ->

    $compile = _$compile_
    $rootScope = _$rootScope_

    angular.mock.inject ($injector, $q) ->
      MyWallet = $injector.get("MyWallet")

      MyWallet.browserCheckFast = () -> null

    return
  )

  beforeEach ->
    $rootScope.browser = {disabled: true}
    element = $compile("<browser-detection result='browser'></browser-detection>")($rootScope)
    $rootScope.$digest()
    isoScope = element.isolateScope()
    isoScope.$digest()

  it "should have text", ->
    expect(element.html()).toContain "text-warning"

  describe "performCheck()", ->

    it "should not show an error when above minimum version", ->
      spyOn(window, "browserDetection").and.returnValue {version: 100, browser: "Chrome"}
      spyOn(MyWallet, "browserCheckFast").and.returnValue true

      isoScope.performCheck()
      isoScope.$digest()
      expect(isoScope.result.disabled).toBe(false)

    it "should show an error when below minimum version", ->
      spyOn(window, "browserDetection").and.returnValue {version: 10, browser: "Chrome"}
      spyOn(MyWallet, "browserCheckFast").and.returnValue true

      isoScope.performCheck()
      isoScope.$digest()
      expect(isoScope.result.disabled).toBe(true)
      expect(isoScope.result.msg).toEqual('MINIMUM_BROWSER|Chrome|10|45')

    it "should warn against an unknown but safe browser", ->
      spyOn(MyWallet, "browserCheckFast").and.returnValue true
      spyOn(window, "browserDetection").and.returnValue {version: 1, browser: "Random"}

      isoScope.performCheck()
      isoScope.$digest()
      expect(isoScope.result.disabled).toBe(false)
      expect(isoScope.result.msg).toEqual('UNKNOWN_BROWSER')

    it "should reject an unknown unsafe browser", ->
      spyOn(MyWallet, "browserCheckFast").and.returnValue false
      spyOn(window, "browserDetection").and.returnValue {version: 1, browser: "Random"}

      isoScope.performCheck()
      isoScope.$digest()
      expect(isoScope.result.disabled).toBe(true)
      expect(isoScope.result.msg).toEqual('UNSUITABLE_BROWSER')

    it "should warn against IE, but allow it", ->
      spyOn(window, "browserDetection").and.returnValue {version: 11, browser: "ie"}
      spyOn(MyWallet, "browserCheckFast").and.returnValue true

      isoScope.performCheck()
      isoScope.$digest()

      expect(isoScope.result.disabled).toBe(false)
      expect(isoScope.result.msg).toEqual('WARN_AGAINST_IE')

    describe "old Safari", ->
      beforeEach ->
        spyOn(window, "browserDetection").and.returnValue {version: 300, browser: "safari", webkit: {major: 200, minor: 0, patch: 0}}
        spyOn(isoScope, "getUserAgent").and.returnValue "... Version/5.1.2 Safari/534.54"
        spyOn(MyWallet, "browserCheckFast").and.returnValue true

        isoScope.performCheck()
        isoScope.$digest()

      it "should be rejected", ->
        expect(isoScope.result.disabled).toBe(true)

      it "should include Safari version in error message", ->
        expect(isoScope.result.msg).toEqual("MINIMUM_BROWSER|Safari|5.1|8.0.6")

    it "should permit modern Safari", ->
      spyOn(window, "browserDetection").and.returnValue {version: 610, browser: "safari", webkit: {major: 610, minor: 0, patch: 0}}
      spyOn(MyWallet, "browserCheckFast").and.returnValue true

      isoScope.performCheck()
      isoScope.$digest()

      expect(isoScope.result.disabled).toBe(false)

    it "should disallow old Webkit", ->
      spyOn(window, "browserDetection").and.returnValue {version: 2, browser: "obscure", webkit: {major: 200, minor: 0, patch: 0}}

      isoScope.performCheck()
      isoScope.$digest()

      expect(isoScope.result.disabled).toBe(true)

    it "should permit modern Webkit if safe", ->
      spyOn(MyWallet, "browserCheckFast").and.returnValue true
      spyOn(window, "browserDetection").and.returnValue {version: 2, browser: "obscure", webkit: {major: 610, minor: 0, patch: 0}}

      isoScope.performCheck()
      isoScope.$digest()

      expect(isoScope.result.disabled).toBe(false)

    it "should reject modern non-Safari Webkit if unsafe", ->
      spyOn(MyWallet, "browserCheckFast").and.returnValue false
      spyOn(window, "browserDetection").and.returnValue {version: 2, browser: "obscure", webkit: {major: 600, minor: 0, patch: 0}}

      isoScope.performCheck()
      isoScope.$digest()

      expect(isoScope.result.disabled).toBe(true)
