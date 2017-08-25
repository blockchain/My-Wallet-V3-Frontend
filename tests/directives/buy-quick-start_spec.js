describe('buyQuickStart', () => {
  let $q;
  let scope;
  let element;
  let isoScope;
  let currency;
  let MyWallet;
  let buySell;

  beforeEach(module('walletDirectives'));

  beforeEach(module('walletApp'));

  beforeEach(inject(function ($compile, $rootScope, $injector, _$q_, $httpBackend) {
    // TODO: use Wallet mock, so we don't need to mock this $httpBackend call
    $httpBackend.whenGET('/Resources/wallet-options.json').respond();

    $q = _$q_;
    scope = $rootScope.$new();
    scope.transaction = {
      'fiat': 1,
      'currency': {'code': 'USD'}
    };
    scope.exchangeRate = {fiat: 0};

    MyWallet = $injector.get('MyWallet');

    MyWallet.wallet = {
      external: {
        coinify: {
          getBuyQuote () { return $q.resolve([]); }
        }
      }
    };

    let limits = {
      bank: {
        min: {
          'EUR': 10
        },
        max: {
          'EUR': 1000
        }
      },
      card: {
        min: {
          'EUR': 10
        },
        max: {
          'EUR': 1000
        }
      }
    };

    buySell = $injector.get('buySell');
    currency = $injector.get('currency');

    buySell.getExchange = () =>
      ({
        profile: {
          level: {
            limits: {
              bank: { inDaily: 0 },
              card: { inDaily: 300 }
            }
          }
        },
        user: {},
        getBuyQuote () { return $q.resolve([]); },
        kycs: [{ id: 1 }]
      })
    ;

    currency.conversions.USD = { conversion: 1000, symbol: '$' };

    buySell.getMinLimits = () => $q.resolve(limits);
    buySell.cancelTrade = () => $q.resolve(trade);
    buySell.getQuote = () => $q.resolve(quote);
    buySell.fetchProfile = () => $q.resolve(true);

    let mediums = {
      'card': {
        getAccounts () { return $q.resolve([]); }
      },
      'bank': {
        getAccounts () { return $q.resolve([]); }
      }
    };

    var quote = {
      quoteAmount: 1,
      baseAmount: -100,
      baseCurrency: 'USD',
      paymentMediums: mediums,
      getPaymentMediums () { return $q.resolve(mediums); }
    };

    element = $compile("<buy-quick-start transaction='transaction' currency-symbol='currencySymbol'></buy-quick-start>")(scope);
    scope.$digest();
    isoScope = element.isolateScope();
    return isoScope.$digest();
  })
  );

  describe('.updateLastInput()', () =>

    it('should update last input field', () => {
      isoScope.updateLastInput('btc');
      expect(isoScope.lastInput).toBe('btc');
      isoScope.updateLastInput('fiat');
      expect(isoScope.lastInput).toBe('fiat');
    })
  );

  describe('.getQuote()', () =>

    it('should get a quote based on last input', () => {
      spyOn(buySell, 'getQuote');
      isoScope.transaction.fiat = 1;
      isoScope.transaction.currency = {code: 'USD'};
      isoScope.getQuote();
      expect(buySell.getQuote).toHaveBeenCalledWith(1, 'USD');
      isoScope.transaction.btc = 1;
      isoScope.transaction.currency = {code: 'USD'};
      isoScope.updateLastInput('btc');
      isoScope.getQuote();
      expect(buySell.getQuote).toHaveBeenCalledWith(-1, 'BTC', 'USD');
    })
  );

  describe('.cancelTrade()', () =>

    it('should cancel a trade', () => {
      spyOn(buySell, 'cancelTrade');
      isoScope.cancelTrade();
      expect(buySell.cancelTrade).toHaveBeenCalled();
      isoScope.$digest();
      expect(isoScope.disabled).toBe(false);
    })
  );

  describe('.handleLimitError()', () =>

    it('should set the limit error message', () => {
      isoScope.handleLimitError();
      expect(isoScope.status.limitError).toBe(true);
      isoScope.profile.level = '2';
      isoScope.handleLimitError();
      expect(isoScope.status.limitMessage).toBe('COINIFY_LIMITS.DAILY_LIMIT_IS');
      isoScope.profile.level = '1';
      isoScope.exchange.kycs = [{ id: 2, state: 'pending' }];
      isoScope.handleLimitError();
      expect(isoScope.status.limitMessage).toBe('COINIFY_LIMITS.KYC_PENDING');
      isoScope.exchange.kycs = [{ id: 3, state: 'rejected' }];
      isoScope.handleLimitError();
      expect(isoScope.status.limitMessage).toBe('COINIFY_LIMITS.KYC_REJECTED');
    })
  );

});
