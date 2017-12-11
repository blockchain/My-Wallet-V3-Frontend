describe('coinify service', () => {
  let $rootScope;
  let $q;
  let Wallet;
  let MyWallet;
  let coinify;
  let exchange;
  let Alerts;
  let Exchange;
  let modals;

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
      modals = $injector.get('modals');


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
            user: true,
            limits: {
              blockchain: {
                inRemaining: {}
              }
            },
            trades: [
              { id: 1, amount: 10, _state: 'completed', get state() { return this._state } },
              { id: 2, amount: 20, _state: 'processing' },
              { id: 3, amount: 30, _state: 'awaiting_transfer_in' }
            ],
            subscriptions: [
              {id: 1, frequency: 'weekly'}
            ],
            kycs: [
              {id: 1, status: 'pending'}
            ],
            profile: {
              canTrade: true,
              level: { name: 1 },
              limits: {
                blockchain: {
                  inRemaining: {
                    'BTC': .1
                  },
                  minimumInAmounts: {
                    'BTC': .05
                  }
                }
              }
            },
            getBuyCurrencies: () => {},
            getTrades: () => {},
            getBuyQuote: () => {},
            getSellQuote: () => {},
            getSubscriptions: () => {},
            cancelSubscription: (id) => {},
            triggerKYC: () => {}
          }
        }
      };

      Exchange = {
        setSellMax (bal) {
          Exchange.sellMax = bal / 1e8
        }
      }

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
    Exchange.setSellMax(61405230)

    let trades = ['processing', 'completed', 'completed_test', 'cancelled'].map(makeTrade);

    spyOn(exchange, 'getBuyCurrencies').and.returnValue($q.resolve(['USD', 'EUR']));
    spyOn(exchange, 'getTrades').and.returnValue($q.resolve(trades));
  });

  describe('getters', () => {
    it('should return basic info', () => {
      let service = exchange;
      expect(coinify.limits).toEqual(MyWallet.wallet.external.coinify.profile.limits)
      expect(coinify.trades.length).toEqual(3)
      expect(coinify.subscriptions[0].frequency).toEqual('weekly')
      expect(coinify.kycs.length).toEqual(1)
      expect(coinify.userCanTrade).toEqual(true)
      expect(coinify.remainingBelowMin).toEqual(false)
      expect(coinify.balanceAboveMin).toEqual() // TODO fix
      expect(coinify.balanceAboveMax).toEqual()
      expect(coinify.usercanTrade).toEqual(true)
      expect(coinify.userCanSell).toEqual()
      expect(coinify.buyReason).toEqual('has_remaining_buy_limit')
      expect(coinify.sellReason).toEqual('not_enough_funds_to_sell')
      expect(coinify.buyLaunchOptions).toEqual({'KYC': coinify.openPendingKYC})
    });
  });

  describe('tradeStateIn', () => {
    let states;
    beforeEach(function () {
      states = {
        error: ['expired', 'rejected', 'cancelled'],
        success: ['completed', 'completed_test'],
        pending: ['awaiting_transfer_in', 'reviewing', 'processing', 'pending', 'updateRequested'],
        completed: ['expired', 'rejected', 'cancelled', 'completed', 'completed_test']
      };
    })
    it('should return the trade state', () => {
      expect(coinify.tradeStateIn(states.completed)(coinify.trades[0])).toEqual(true);
    })
  });

  describe('buyLaunchOptions', () => {
    it('should return KYC prompt', () => {
      expect(coinify.buyLaunchOptions).toEqual({'KYC': coinify.openPendingKYC})
    })
  });

  describe('sellLaunchOptions', () => {
    it('should return request or buy options', () => {
      expect(coinify.sellLaunchOptions).toEqual({ 'REQUEST': modals.openRequest, 'BUY': coinify.goToBuy })
    })
  });

  describe('getQuote', () => {
    it('should fetch a quote', () => {
      spyOn(coinify.exchange, 'getBuyQuote').and.returnValue($q.resolve());
      coinify.getQuote(1, 'EUR', 'BTC');
      expect(coinify.exchange.getBuyQuote).toHaveBeenCalled();
    })
  });

  describe('getSellQuote', () => {
    it('should fetch a sell quote', () => {
      spyOn(coinify.exchange, 'getSellQuote').and.returnValue($q.resolve());
      coinify.getSellQuote(1, 'BTC', 'EUR');
      expect(coinify.exchange.getSellQuote).toHaveBeenCalled();
    })
  });

  describe('getSubscriptions()', () => {
    it('should call exchange.getSubscriptions()', () => {
      spyOn(coinify.exchange, 'getSubscriptions').and.returnValue($q.resolve());
      coinify.getSubscriptions();
      expect(coinify.exchange.getSubscriptions).toHaveBeenCalled()
    })
  });

  describe('cancelSubscription()', () => {
    it('should call exchange.cancelSubscription()', () => {
      spyOn(coinify.exchange, 'cancelSubscription').and.returnValue($q.resolve());
      coinify.cancelSubscription(1);
      expect(coinify.exchange.cancelSubscription).toHaveBeenCalledWith(1);
    })
  });

  describe('getPendingKYC()', () => {
    it('should return the first KYC', () => {
      expect(coinify.getPendingKYC()).toEqual(false);
    })
  });

  describe('getPendingTrade', () => {
    it('should return a trade with state "awaiting_transfer_in"', () => {
      expect(coinify.getPendingTrade()).toEqual(coinify.trades[2]);
    })
  });

  describe('getProcessingTrade', () => {
    it('should return a trade with state "processing"', () => {
      expect(coinify.getProcessingTrade()).toEqual(coinify.trades[1]);
    })
  });

  describe('openPendingTrade', () => {
    it('should call the modal service"', () => {
      spyOn(modals, 'openBuyView');
      coinify.openPendingTrade();
      expect(modals.openBuyView).toHaveBeenCalled();
    })
  });

  describe('openProcessingTrade', () => {
    it('should call the modal service"', () => {
      spyOn(modals, 'openBuyView');
      coinify.openProcessingTrade();
      expect(modals.openBuyView).toHaveBeenCalled();
    })
  });

  describe('openTradingDisabledHelper()', () => {
    it('should call modals.openHelper"', () => {
      spyOn(modals, 'openHelper');
      coinify.openTradingDisabledHelper();
      expect(modals.openHelper).toHaveBeenCalled();
    })
  });

  describe('getRejectedKYC()', () => {
    beforeEach(function () {
      MyWallet.wallet.external.coinify.kycs = [
        {id: 2, state: 'rejected'}
      ]
    });

    it('should return the first KYC', () => {
      expect(coinify.getRejectedKYC()).toEqual(coinify.kycs[0])
    })
  });

  describe('getOpenKYC()', () => {
    beforeEach(function () {
      MyWallet.wallet.external.coinify.kycs = [
        {id: 2, state: 'pending'}
      ]
    })

    it('should return the pending KYC', () => {
      expect(coinify.getOpenKYC()).toEqual(coinify.kycs[0])
    })
  })

  describe('openPendingKYC()', () => {
    it('should call modals.openBuyView"', () => {
      spyOn(modals, 'openBuyView');
      coinify.openPendingKYC();
      expect(modals.openBuyView).toHaveBeenCalled();
    })
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
