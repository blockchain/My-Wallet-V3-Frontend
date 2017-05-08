describe('SfoxCheckoutController', () => {
  let $rootScope;
  let $controller;
  let $compile;
  let $templateCache;
  let $q;
  let $timeout;
  let scope;
  let Wallet;
  let MyWallet;
  let buySell;

  beforeEach(angular.mock.module('walletApp'));

  beforeEach(() =>
    angular.mock.inject(function ($injector, _$rootScope_, _$controller_, _$compile_, _$templateCache_) {
      $rootScope = _$rootScope_;
      $controller = _$controller_;
      $compile = _$compile_;
      $templateCache = _$templateCache_;

      $q = $injector.get('$q');
      $timeout = $injector.get('$timeout');
      Wallet = $injector.get('Wallet');
      MyWallet = $injector.get('MyWallet');
      let MyWalletHelpers = $injector.get('MyWalletHelpers');
      buySell = $injector.get('buySell');

      MyWallet.wallet = {
        accountInfo: {
          email: 'random'
        },
        external: {
          coinify: {
            profile: {}
          },
          shouldDisplaySellTab () { return true; }
        }
      };
      Wallet.accounts = () => [];
      Wallet.settings = {
        currency: {
          code: 'BTC'
        }
      };
      MyWalletHelpers.exponentialBackoff = () => ({});

      let currency = $injector.get('currency');
      currency.conversions["USD"] = { conversion: 2 };

      buySell.getStatus = () => ({
        metaDataService: true
      }) ;

      buySell.getCurrency = () => ({
        code: 'BTC'
      }) ;

      buySell.fetchProfile = () => $q.resolve();

      return buySell.getExchange = () => ({
        getBuyCurrencies () { return $q.resolve(['BTC', 'USD']); },
        getTrades () { return $q.resolve(); },
        getKYCs () { return $q.resolve(); },
        exchangeRate: {
          get () { return $q.resolve({"baseCurrency":"EUR","quoteCurrency":"BTC","rate":0.0019397889509621354}); }
        },
        trades: {
          pending: {}
        },
        user: 1,
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
      }) ;}));

  let getControllerScope = function () {
    scope = $rootScope.$new();

    let options = {
      partners: {
        coinify: {
          countries: ["GB"]
        }
      }
    };

    let template = $templateCache.get('partials/buy-sell.pug');
    $controller("BuySellCtrl", {
      $scope: scope,
      options
    }
    );
    $compile(template)(scope);
    return scope;
  };

  it('should set status on init', () => {
    scope = getControllerScope();
    expect(scope.status.loading).toBe(false);
  });

  describe('onCloseModal', () => {
    beforeEach(() => scope.onCloseModal());

    it("should set modalOpen to false", () => expect(scope.status.modalOpen).toBe(false));
  });

  describe("getDays()", () =>
    it('should calculate the correct number of days', () => {
      scope = getControllerScope();
      spyOn(Date, 'now').and.returnValue(new Date('12/20/2016'));
      spyOn(buySell, 'getExchange').and.returnValue({
        profile: { canTradeAfter: new Date('12/21/2016') }});
      expect(scope.getDays()).toBe(1);
    })
  );
});
