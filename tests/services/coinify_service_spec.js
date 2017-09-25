describe('coinify service', () => {
  let Wallet;
  let MyWallet;
  let coinify;
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

      coinify = $injector.get('coinify');

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

    it('should watch completed trades and be initialized', () => {
      coinify.getTrades();
      $rootScope.$digest();
      expect(coinify.watchAddress).toHaveBeenCalledTimes(1);
    });
  });

  describe('watchAddress', () => {
    let trades = {};

    beforeEach(function () {
      trades = {pending: makeTrade('processing'), completed: makeTrade('completed')};
      return Object.keys(trades).forEach(t => spyOn(trades[t], 'watchAddress').and.callThrough());
    });

    it('should watch if bitcoin has not been received', () => {
      coinify.watchAddress(trades.pending);
      expect(trades.pending.watchAddress).toHaveBeenCalled();
    });

    it('should open the buy modal when bitcoin is received', inject(function (modals) {
      spyOn(modals, 'openBuyView');
      coinify.watchAddress(trades.pending);
      $rootScope.$digest();
      expect(modals.openBuyView).toHaveBeenCalled();
    })
    );
  });

  describe('fetchProfile', () => {
    exchange = undefined;
    let fetchFailWith;

    beforeEach(function () {
      exchange = coinify.exchange;
      spyOn(exchange, 'fetchProfile').and.callFake(function () {
        if (fetchFailWith != null) { return $q.reject(fetchFailWith); } else { return $q.resolve(); }
      });
      return spyOn(coinify, 'getTrades').and.callThrough();
    });

    it('should reject with the error if there is one', () => {
      fetchFailWith = JSON.stringify({error: 'some_err'});
      coinify.fetchProfile().catch(e => expect(e).toEqual('SOME_ERR'));
      $rootScope.$digest();
      expect(coinify.getTrades).not.toHaveBeenCalled();
    });

    it('should reject default error if error is not json', () => {
      fetchFailWith = 'unknown_err';
      coinify.fetchProfile().catch(e => expect(e).toEqual('INVALID_REQUEST'));
      $rootScope.$digest();
      expect(coinify.getTrades).not.toHaveBeenCalled();
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

  describe('isPendingSellTrade()', () => {
    let pendingTrade;
    exchange = undefined;
    beforeEach(function () {
      exchange = coinify.exchange;
      pendingTrade = {
        state: 'awaiting_transfer_in',
        medium: 'blockchain'
      };
    });

    it('should return true', () => {
      let result = coinify.isPendingSellTrade(pendingTrade);
      expect(result).toEqual(true);
    });
  });
});
