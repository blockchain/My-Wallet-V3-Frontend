describe('coinify service', () => {
  let $rootScope;
  let $q;
  let Wallet;
  let MyWallet;
  let coinify;
  let exchange;
  let Alerts;

  beforeEach(angular.mock.module('walletApp'));

  beforeEach(() => {
    module(($provide) => {
      $provide.value('Env', Promise.resolve({
        showBuySellTab: ['US'],
        partners: {
          coinify: { countries: ['US'] }
        }
      }));
    });

    angular.mock.inject(function ($injector, _$rootScope_, _$q_) {
      $rootScope = _$rootScope_;
      $q = _$q_;
      Wallet = $injector.get('Wallet');
      MyWallet = $injector.get('MyWallet');
      Alerts = $injector.get('Alerts');
      coinify = $injector.get('coinify');

      MyWallet.wallet = {
        accountInfo: {
          countryCodeGuess: {}
        },
        hdwallet: {
          accounts: [{label: ''}, {label: '2nd account'}],
          defaultAccount: {index: 0}
        },
        external: {
          coinify: {
            getBuyCurrencies: () => {},
            getTrades: () => {}
          }
        }
      };

      Wallet.settings.currency = {code: 'EUR'};
      Wallet.status.isLoggedIn = true;
    });
  });

  let makeTrade = state => ({
    state,
    accountIndex: 0,
    inCurrency: 'USD',
    bitcoinReceived: state === 'completed',
    watchAddress () { return $q.resolve(); },
    refresh () { return $q.resolve(); }
  });

  beforeEach(function () {
    exchange = coinify.exchange;

    let trades = ['processing', 'completed', 'completed_test', 'cancelled'].map(makeTrade);

    spyOn(exchange, 'getBuyCurrencies').and.returnValue($q.resolve(['USD', 'EUR']));
    spyOn(exchange, 'getTrades').and.returnValue($q.resolve(trades));
  });

  describe('getTrades', () => {
    beforeEach(() => spyOn(coinify, 'watchAddress').and.returnValue($q.resolve()));

    it('should call exchange.getTrades', () => {
      coinify.getTrades();
      expect(exchange.getTrades).toHaveBeenCalled();
    });

    it('should sort the trades into pending and completed arrays', () => {
      coinify.getTrades();
      $rootScope.$digest();
      expect(coinify.trades.pending.length).toEqual(1);
      expect(coinify.trades.completed.length).toEqual(3);
    });
  });

  describe('cancelTrade', () => {
    let trade;
    beforeEach(function () {
      trade = { cancel () {} };
      return spyOn(Alerts, 'displayError');
    });

    it('should confirm before canceling', () => {
      spyOn(Alerts, 'confirm').and.returnValue($q.resolve());
      coinify.cancelTrade(trade);
      expect(Alerts.confirm).toHaveBeenCalled();
    });

    it('should not cancel if confirm was rejected', () => {
      spyOn(trade, 'cancel').and.returnValue($q.resolve());
      spyOn(Alerts, 'confirm').and.returnValue($q.reject());
      coinify.cancelTrade(trade);
      $rootScope.$digest();
      expect(trade.cancel).not.toHaveBeenCalled();
    });

    it('should show an error if the cancel fails', () => {
      spyOn(trade, 'cancel').and.returnValue($q.reject('ERROR_TRADE_CANCEL'));
      spyOn(Alerts, 'confirm').and.returnValue($q.resolve());
      coinify.cancelTrade(trade);
      $rootScope.$digest();
      expect(Alerts.displayError).toHaveBeenCalledWith('ERROR_TRADE_CANCEL');
    });
  });
});
