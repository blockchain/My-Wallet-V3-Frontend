describe "OptionsServices", () ->
  $httpBackend = undefined
  Options = undefined

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, _$rootScope_) ->

      $httpBackend = $injector.get("$httpBackend")

      Options = $injector.get("Options")
      rootScope = _$rootScope_

      return

    return

  describe "get()", ->
    response = undefined

    beforeEach ->
      $httpBackend.expectGET("/Resources/wallet-options.json").respond JSON.stringify({
        showBuySellTab: ["US"],
        partners: {
          coinify: {
            countries: ["US"]
          }
        }
      })


    it "should download a list of options", ->
      Options.get().then((data) ->
        response = data
      )

      $httpBackend.flush()

      expect(response.showBuySellTab).toEqual(['US'])

    it "should cache the result", ->
      Options.get().then((data) ->
        response = data
      )

      $httpBackend.flush()

      Options.get().then((data) ->
        response = data
      )

      expect(() -> $httpBackend.flush()).toThrow()

  afterEach ->
    $httpBackend.verifyNoOutstandingExpectation()
    $httpBackend.verifyNoOutstandingRequest()
