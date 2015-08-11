describe "didYouKnowServices", () ->
  DIY = undefined

  beforeEach angular.mock.module("walletApp")

  beforeEach ->

    translateMock =
      instant: (string) ->
        string

    module(($provide) ->
      $provide.value("$translate",translateMock)
      return
    )

    angular.mock.inject ($injector) ->
      DIY = $injector.get("DidYouKnow")

  describe "initialization", ->
    it "should provide localized titles", ->
      expect(DIY.dyks.length).toBeGreaterThan(0)
      expect(DIY.dyks[0].title).toEqual("DYK1_TITLE")
