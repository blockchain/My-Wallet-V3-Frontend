describe "SfoxCheckoutController", ->
  $rootScope = undefined
  $controller = undefined
  $compile = undefined
  $templateCache = undefined
  $q = undefined
  $timeout = undefined
  scope = undefined
  Wallet = undefined
  MyWallet = undefined
  buySell = undefined

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, _$rootScope_, _$controller_, _$compile_, _$templateCache_) ->
      $rootScope = _$rootScope_
      $controller = _$controller_
      $compile = _$compile_
      $templateCache = _$templateCache_

      $q = $injector.get('$q')
      $timeout = $injector.get('$timeout')
      Wallet = $injector.get('Wallet')
      MyWallet = $injector.get("MyWallet")
      MyWalletHelpers = $injector.get('MyWalletHelpers')
      buySell = $injector.get('buySell')

      MyWallet.wallet = {
        accountInfo: {
          email: 'random'
        },
        external: {
          coinify: {
            profile: {}
          }
          shouldDisplaySellTab: () -> true
        }
      }
      Wallet.accounts = () -> []
      Wallet.settings = {
        currency: {
          code: 'BTC'
        }
      }
      MyWalletHelpers.exponentialBackoff = () -> {}

      currency = $injector.get("currency")
      currency.conversions["USD"] = { conversion: 2 }

      buySell.getStatus = () -> {
        metaDataService: true
      }

      buySell.getCurrency = () -> {
        code: 'BTC'
      }

      buySell.fetchProfile = () -> $q.resolve()

      buySell.getExchange = () -> {
        getBuyCurrencies: -> $q.resolve(['BTC', 'USD'])
        getTrades: -> $q.resolve()
        getKYCs: -> $q.resolve()
        exchangeRate: {
          get: -> $q.resolve({"baseCurrency":"EUR","quoteCurrency":"BTC","rate":0.0019397889509621354})
        }
        trades: {
          pending: {}
        }
        user: 1
        profile: {
          level: {
            limits: {
              'card': {
                in: 300
              },
              'bank': {
                in: 0
              }
            }
          }
        }
      }

  getControllerScope = () ->
    scope = $rootScope.$new()

    options =
      partners:
        coinify:
          countries: ["GB"]

    template = $templateCache.get('partials/buy-sell.pug')
    $controller "BuySellCtrl",
      $scope: scope
      options: options
    $compile(template)(scope)
    scope

  it "should set status on init", ->
    scope = getControllerScope()
    expect(scope.status.loading).toBe(false);

  describe "onCloseModal", ->
    beforeEach ->
      scope.onCloseModal()

    it "should set modalOpen to false", ->
      expect(scope.status.modalOpen).toBe(false);

  describe "getDays()", ->
    it "should calculate the correct number of days", ->
      scope = getControllerScope()
      spyOn(Date, "now").and.returnValue(new Date('12/20/2016'))
      spyOn(buySell, "getExchange").and.returnValue
        profile: { canTradeAfter: new Date('12/21/2016') }
      expect(scope.getDays()).toBe(1);
