describe('coinify service', () => {
  let $rootScope;
  let $q;
  let Wallet;
  let MyWallet;
  let coinify;
  let exchange;
  let Exchange;
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
      Exchange = $injector.get('Exchange');

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
            getTrades: () => {},
            getBuyCurrencies: () => {},
            kycs: [{status: 'processing'}],
            trades: [{status: 'completed'}],
            subscriptions: [{}],
            profile: {
              limits: {
                card: { inRemaining: 100 },
                bank: { inRemaining: 20 }
              },
              cannotTradeReason: 'cannot_trade_reason'
            }
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
  
  describe('getters', () => {
    it('should return kycs', () => { expect(coinify.kycs).toBe(MyWallet.wallet.external.coinify.kycs) })
    it('should return trades', () => { expect(coinify.trades).toBe(MyWallet.wallet.external.coinify.trades) })
    it('should return limits', () => { expect(coinify.limits).toBe(MyWallet.wallet.external.coinify.profile.limits) })
    it('should return subscriptions', () => { expect(coinify.subscriptions).toBe(MyWallet.wallet.external.coinify.subscriptions) })
    
    describe('userCanTrade', () => {
      it('should return true if user can trade', () => {
        MyWallet.wallet.external.coinify.user = 1
        MyWallet.wallet.external.coinify.profile.canTrade = false
        expect(coinify.userCanTrade).toBe(false)
        MyWallet.wallet.external.coinify.profile.canTrade = true
        expect(coinify.userCanTrade).toBe(true)
      })
    });
    
    describe('remainingBelowMin', () => {
      it('should return true if inRemaining limit is below min', () => {
        MyWallet.wallet.external.coinify.profile.limits.blockchain = { inRemaining: { 'BTC': .000001 }, minimumInAmounts: { 'BTC': 1 } }
        expect(coinify.remainingBelowMin).toBe(true)
      })
    });
    
    describe('balanceAboveMin', () => {
      it('should return true if balance is above min', () => {
        Exchange.sellMax = 500000;
        MyWallet.wallet.external.coinify.profile.limits.blockchain = { minimumInAmounts: { 'BTC': 5 } }
        expect(coinify.balanceAboveMin).toBe(true)
      })
    });
    
    describe('balanceAboveMax', () => {
      it('should return true if balance is above max', () => {
        Exchange.sellMax = 500000;
        MyWallet.wallet.external.coinify.profile.limits.blockchain = { inRemaining: { 'BTC': 5 } }
        expect(coinify.balanceAboveMax).toBe(true)
      })
    });

    describe('userCanBuy', () => {
      it('should return true if userCanTrade', () => {
        MyWallet.wallet.external.coinify.profile.canTrade = true
        expect(coinify.userCanBuy).toBe(true)
      });
    });

    describe('userCanSell', () => {
      it('should return true if balance is above min and remaining is below min', () => {
        Exchange.sellMax = 5;
        MyWallet.wallet.external.coinify.profile.limits.blockchain = { inRemaining: { 'BTC': 2 }, minimumInAmounts: { 'BTC': 1 } }
        expect(coinify.userCanSell).toBe(true)
      });
    });
    
    describe('buyReason', () => {
      it('should return the buy reason', () => {
        expect(coinify.buyReason).toBe('user_needs_account');
        MyWallet.wallet.external.coinify.user = 1
        expect(coinify.buyReason).toBe('cannot_trade_reason');
        MyWallet.wallet.external.coinify.profile.canTrade = true
        expect(coinify.buyReason).toBe('has_remaining_buy_limit');
      })
    });
    
    describe('sellReason', () => {
      it('should return the sell reason', () => {
        Exchange.sellMax = 1;
        MyWallet.wallet.external.coinify.profile.limits.blockchain = { minimumInAmounts: { 'BTC': 5 } }
        expect(coinify.sellReason).toBe('not_enough_funds_to_sell')
        Exchange.sellMax = 1;
        MyWallet.wallet.external.coinify.profile.limits.blockchain = { minimumInAmounts: { 'BTC': .00001 }, inRemaining: { 'BTC': .01 } }
        expect(coinify.sellReason).toBe('can_sell_remaining_balance')
      })
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
