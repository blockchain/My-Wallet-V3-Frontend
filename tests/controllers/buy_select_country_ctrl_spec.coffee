describe "BuySelectCountryCtrl", ->
  scope = undefined
  country = undefined
  MyWallet = undefined
  buySell = undefined
  $rootScope = undefined
  $controller = undefined

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, _$rootScope_, _$controller_, _$q_, _$timeout_) ->
      $rootScope = _$rootScope_
      $controller = _$controller_

      MyWallet = $injector.get("MyWallet")
      country = $injector.get("country")
      buySell = $injector.get("buySell")

      buySell.getExchange = () ->
        profile: {}
        user: {}

      MyWallet.wallet = {}
      MyWallet.wallet.accountInfo = {}
      MyWallet.wallet.hdwallet =
        accounts: [{ label: 'My Bitcoin Wallet'}, {label: 'New Wallet'}]
        defaultAccount: {index: 0}

  getControllerScope = (params = {}) ->
    scope = $rootScope.$new()
    $controller "BuySelectCountryCtrl",
      $scope: scope,
    scope

  beforeEach ->
    scope = getControllerScope()
    $rootScope.$digest()

  describe "startsWith", ->
    it "should filter countries that start with the search", ->
      expect(scope.startsWith('Americaaa', 'am')).toBe(true)

  describe "signupForAccess", ->
    it "should call buySell signup", ->
      scope.$parent = {
        fields: {
          email: 'p@b.com'
        }
      }
      scope.fields = { countryCode: 'US' }
      spyOn(buySell, 'signupForAccess')
      scope.signupForAccess()
      expect(buySell.signupForAccess).toHaveBeenCalled()
