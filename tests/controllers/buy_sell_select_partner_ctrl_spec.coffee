describe "BuySellSelectPartnerController", ->
  $rootScope = undefined
  $controller = undefined
  $state = undefined
  MyWallet = undefined
  scope = undefined
  sfox = undefined
  coinify = undefined
  accountInfo = undefined

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    accountInfo = {
      countryCodeGuess: "US"
    }

    angular.mock.inject ($injector, _$rootScope_, _$controller_, _$state_) ->
      $rootScope = _$rootScope_
      $controller = _$controller_
      $state = _$state_

      MyWallet = $injector.get("MyWallet")

      MyWallet.wallet =
        accountInfo: accountInfo

  getControllerScope = () ->
    $scope = $rootScope.$new()

    $scope.vm =
      base: "base"

    options =
      partners:
        coinify:
          countries: ["GB"]
        sfox:
          countries: ["US"]
          states: ["AL"]

    $controller "BuySellSelectPartnerController",
      $scope: $scope
      options: options
      buyStatus:
        canBuy: () -> Promise.resolve(true)
      state: {
        stateCodes: [
          {Code: 'AL'}
        ]
      }
      country: {
        countryCodes: [
          {Code: "US"},
          {Code: "GB", Name: "United Kingdom"}
          {Code: "RU"}
        ]
      }

    return $scope

  it "should try to guess the country code", ->
    accountInfo.countryCodeGuess = "GB"
    scope = getControllerScope()
    scope.$digest()
    expect(scope.country.Name).toEqual("United Kingdom")

  it "should continue if the country can't be guessed", ->
    accountInfo.countryCodeGuess = null
    scope = getControllerScope()
    scope.$digest()
    expect(scope.country).not.toBeDefined()

  describe ".selectPartner()", ->
    beforeEach ->
      scope = getControllerScope()
      spyOn($state, "go")

    it "should go to 'coinify' signup", ->
      scope.selectPartner(scope.partners["coinify"], "GB")
      expect($state.go).toHaveBeenCalledWith("base.coinify", countryCode: "GB")

    it "should go to 'sfox' signup", ->
      scope.selectPartner(scope.partners["sfox"], "US")
      expect($state.go).toHaveBeenCalledWith("base.sfox", countryCode: "US")

  describe ".onWhitelist()", ->
    beforeEach ->
      scope = getControllerScope()

    it "should know if a country is on the coinify whitelist", ->
      expect(scope.onWhitelist("GB")).toEqual("coinify")

    it "should know if a country is on the sfox whitelist", ->
      expect(scope.onWhitelist("US")).toEqual("sfox")

    it "should know if a country is not on any whitelist", ->
      expect(scope.onWhitelist("CZ")).toEqual(false)

  describe "partner guess", ->
    it "should guess Coinify in Europe", ->
      accountInfo.countryCodeGuess = "GB"
      scope = getControllerScope()
      scope.$digest()
      expect(scope.partner).toEqual(jasmine.objectContaining({name: 'Coinify'}))

    it "should guess SFOX in the USA", ->
      scope = getControllerScope()
      scope.$digest()
      expect(scope.partner).toEqual(jasmine.objectContaining({name: 'SFOX'}))

    it "should not guess SFOX in the USA for excluded states", ->
      accountInfo.countryCodeGuess = "US"
      scope.state = 'NY'
      scope = getControllerScope()
      scope.$digest()
      expect(scope.partner).toEqual(jasmine.objectContaining({name: 'SFOX'}))

    it "should guess SFOX when user selects US for US IP address", ->
      accountInfo.countryCodeGuess = "US"
      scope = getControllerScope()
      scope.$digest()
      scope.country = {Code: "GB"} # User selects other country
      scope.$digest()
      scope.country = {Code: "US"} # User selects US again
      scope.$digest()
      expect(scope.partner).toEqual(jasmine.objectContaining({name: 'SFOX'}))

    it "should not guess SFOX when user selects US for non-US IP address", -> # Temporary measure
      accountInfo.countryCodeGuess = "GB"
      scope = getControllerScope()
      scope.$digest()
      scope.country = {Code: "US"} # User selects US
      scope.$digest()
      expect(scope.partner).toEqual(null)

    it "should guess nothing for other countries", ->
      accountInfo.countryCodeGuess = "RU"
      scope = getControllerScope()
      scope.$digest()
      expect(scope.partner).toEqual(null)

    it "should guess Coinify if user switches country to Europe", ->
      scope = getControllerScope()
      scope.$digest()
      scope.country = {Code: "GB"}
      scope.$digest()
      expect(scope.partner).toEqual(jasmine.objectContaining({name: 'Coinify'}))

    it "should guess nothing if user switches country to other", ->
      scope = getControllerScope()
      scope.$digest()
      scope.country = {Code: "RU"}
      scope.$digest()
      expect(scope.partner).toEqual(null)
