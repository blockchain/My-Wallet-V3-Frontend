describe('buySell service', () => {
  let Wallet;
  let MyWallet;
  let buySell;
  let $rootScope;
  let $q;
  let exchange;
  let Alerts;

  beforeEach(angular.mock.module('walletApp'));

  beforeEach(() => {
    module(($provide) => {
      $provide.value('Env', Promise.resolve({
        showBuySellTab: ['US'],
        partners: {
          coinify: {
            countries: ['US']
          }
        }
      }));
    });

    angular.mock.inject(function ($injector, _$rootScope_, _$q_) {
      $rootScope = _$rootScope_;
      $q = _$q_;
      Wallet = $injector.get('Wallet');
      MyWallet = $injector.get('MyWallet');
      Alerts = $injector.get('Alerts');

      MyWallet.wallet = {
        accountInfo: {
          countryCodeGuess: {}
        },
        hdwallet: {
          accounts: [{label: ''}, {label: '2nd account'}],
          defaultAccount: {index: 0}
        }
      };

      buySell = $injector.get('buySell');

      Wallet.settings.currency = {code: 'EUR'};
      Wallet.status.isLoggedIn = true;
    });
  });

  let makeTrade = state =>
    ({
      state,
      accountIndex: 0,
      inCurrency: 'USD',
      bitcoinReceived: state === 'completed',
      watchAddress () { return $q.resolve(); },
      refresh () { return $q.resolve(); }
    })
  ;

  beforeEach(function () {
    exchange = buySell.getExchange();

    let trades = ['processing', 'completed', 'completed_test', 'cancelled'].map(makeTrade);

    spyOn(exchange, 'getBuyCurrencies').and.returnValue($q.resolve(['USD', 'EUR']));
    spyOn(exchange, 'getTrades').and.returnValue($q.resolve(trades));
    return spyOn(exchange, 'getKYCs').and.returnValue($q.resolve([]));
  });

  describe('getTrades', () => {
    beforeEach(() => spyOn(buySell, 'watchAddress').and.returnValue($q.resolve()));

    it('should call exchange.getTrades', () => {
      buySell.getTrades();
      expect(exchange.getTrades).toHaveBeenCalled();
    });

    it('should sort the trades into pending and completed arrays', () => {
      buySell.getTrades();
      $rootScope.$digest();
      expect(buySell.trades.pending.length).toEqual(1);
      expect(buySell.trades.completed.length).toEqual(3);
    });

    it('should watch completed trades and be initialized', () => {
      buySell.getTrades();
      $rootScope.$digest();
      expect(buySell.watchAddress).toHaveBeenCalledTimes(1);
    });
  });

  describe('watchAddress', () => {
    let trades = {};

    beforeEach(function () {
      trades = {pending: makeTrade('processing'), completed: makeTrade('completed')};
      return Object.keys(trades).forEach(t => spyOn(trades[t], 'watchAddress').and.callThrough());
    });

    it('should watch if bitcoin has not been received', () => {
      buySell.watchAddress(trades.pending);
      expect(trades.pending.watchAddress).toHaveBeenCalled();
    });

    it('should open the buy modal when bitcoin is received', inject(function (modals) {
      spyOn(modals, 'openBuyView');
      buySell.watchAddress(trades.pending);
      $rootScope.$digest();
      expect(modals.openBuyView).toHaveBeenCalled();
    })
    );
  });

  describe('getMinLimits', () => {
    it('should set bank and card min limits', () => {
      let quote = {
        getPaymentMediums: () => Promise.resolve({
          bank: {
            minimumInAmounts: {
              'USD': 50,
              'EUR': 45
            }
          },
          card: {
            minimumInAmounts: {
              'USD': 10,
              'EUR': 10
            }
          }
        })
      };

      buySell.getMinLimits(quote).then(() => {
        expect(buySell.limits.bank.min['EUR']).toBe(50);
        expect(buySell.limits.bank.min['USD']).toBe(45);
        expect(buySell.limits.card.min['EUR']).toBe(10);
        expect(buySell.limits.card.min['USD']).toBe(10);
      });
    });
  });

  describe('fetchProfile', () => {
    exchange = undefined;
    let fetchFailWith;

    beforeEach(function () {
      exchange = buySell.getExchange();
      spyOn(exchange, 'fetchProfile').and.callFake(function () {
        if (fetchFailWith != null) { return $q.reject(fetchFailWith); } else { return $q.resolve(); }
      });
      return spyOn(buySell, 'getTrades').and.callThrough();
    });

    it('should reject with the error if there is one', () => {
      fetchFailWith = JSON.stringify({error: 'some_err'});
      buySell.fetchProfile().catch(e => expect(e).toEqual('SOME_ERR'));
      $rootScope.$digest();
      expect(buySell.getTrades).not.toHaveBeenCalled();
    });

    it('should reject default error if error is not json', () => {
      fetchFailWith = 'unknown_err';
      buySell.fetchProfile().catch(e => expect(e).toEqual('INVALID_REQUEST'));
      $rootScope.$digest();
      expect(buySell.getTrades).not.toHaveBeenCalled();
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
      buySell.cancelTrade(trade);
      expect(Alerts.confirm).toHaveBeenCalled();
    });

    it('should not cancel if confirm was rejected', () => {
      spyOn(trade, 'cancel').and.returnValue($q.resolve());
      spyOn(Alerts, 'confirm').and.returnValue($q.reject());
      buySell.cancelTrade(trade);
      $rootScope.$digest();
      expect(trade.cancel).not.toHaveBeenCalled();
    });

    it('should show an error if the cancel fails', () => {
      spyOn(trade, 'cancel').and.returnValue($q.reject('ERROR_TRADE_CANCEL'));
      spyOn(Alerts, 'confirm').and.returnValue($q.resolve());
      buySell.cancelTrade(trade);
      $rootScope.$digest();
      expect(Alerts.displayError).toHaveBeenCalledWith('ERROR_TRADE_CANCEL');
    });
  });

  describe('openSellView', () => {
    let trade;
    let bankMedium;
    let payment;
    beforeEach(function () {
      trade = { btc: 1, fiat: 100 };
      bankMedium = {
        getBankAccounts () { return $q.resolve('something'); }
      };
      payment = { fee: 1 };
      exchange = buySell.getExchange();
      exchange.profile = { user: 1 };
    });

    it('should call getExchange', () => {
      buySell.openSellView(trade, bankMedium, payment);
    });
  });
      // expect(result).toEqual

  describe('isPendingSellTrade()', () => {
    let pendingTrade;
    exchange = undefined;
    beforeEach(function () {
      exchange = buySell.getExchange();
      pendingTrade = {
        state: 'awaiting_transfer_in',
        medium: 'blockchain'
      };
    });

    it('should return true', () => {
      let result = buySell.isPendingSellTrade(pendingTrade);
      expect(result).toEqual(true);
    });
  });

  describe('getCurrency', () => {
    let trade;
    let sellCheck;
    exchange = undefined;
    beforeEach(function () {
      exchange = buySell.getExchange();
      trade = makeTrade('processing');
      trade.inCurrency = 'EUR';
      trade = null;
      sellCheck = true;
    });

    it('should return EUR', () => {
      let result = buySell.getCurrency(trade, sellCheck);
      expect(result).toEqual({code: 'EUR'});
    });
  });
});
