describe "BuySellSelectPartnerController", ->
  $rootScope = undefined
  $controller = undefined
  $state = undefined
  MyWallet = undefined
  scope = undefined

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, _$rootScope_, _$controller_, _$state_) ->
      $rootScope = _$rootScope_
      $controller = _$controller_
      $state = _$state_

      MyWallet = $injector.get("MyWallet")

      MyWallet.wallet =
        accountInfo: countryCodeGuess: "US"

  getControllerScope = () ->
    $scope = $rootScope.$new()

    $scope.vm =
      base: "base"

    options = partners:
      coinify: countries: ["GB"]
      sfox: countries: ["US"]

    $controller "BuySellSelectPartnerController",
      $scope: $scope
      options: options

    return $scope

  it "should try to guess the country code", ->
    MyWallet.wallet.accountInfo.countryCodeGuess = "GB"
    scope = getControllerScope()
    expect(scope.country.Name).toEqual("United Kingdom")

  it "should continue if the country can't be guessed", ->
    MyWallet.wallet.accountInfo.countryCodeGuess = null
    scope = getControllerScope()
    expect(scope.country).not.toBeDefined()

  describe ".selectPartner()", ->
    beforeEach ->
      scope = getControllerScope()
      spyOn($state, "go")

    it "should select 'coinify'", ->
      scope.selectPartner(scope.partners["coinify"], "GB")
      expect($state.go).toHaveBeenCalledWith("base.coinify", countryCode: "GB")

    it "should select 'sfox'", ->
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
