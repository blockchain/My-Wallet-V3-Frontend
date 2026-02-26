describe('Activity', () => {
  let Activity;
  let MyWallet;
  let coinify;
  let sfox;
  let unocoin;

  beforeEach(angular.mock.module('walletApp'));
  beforeEach(inject(($injector, $httpBackend) => {
    // TODO: use Wallet mock, so we don't need to mock this $httpBackend call
    $httpBackend.whenGET('/Resources/wallet-options.json').respond();
    MyWallet = $injector.get('MyWallet');

    MyWallet.wallet.txList = {
      subscribe: () => () => {},
      transactions: () => [{ amount: 1, time: 25, txType: 'received', coinCode: 'btc' }]
    };

    MyWallet.wallet.bch = {
      txs: [{ amount: 1, txType: 'received', coinCode: 'bch'}]
    };

    MyWallet.wallet.external = {
      coinify: {
        trades: [
          {id: 1, txHash: '12345abcde'}
        ],
        profile: {
          limits: {
            blockchain: {
              inRemaining: {
                BTC: .05,
              },
              minimumInAmounts: {
                BTC: .005
              }
            }
          }
        },
        kycs: []
      },
      sfox: {
        trades: [
          {id: 1, txHash: '12345ab32cde'}
        ],
      },
      unocoin: {
        trades: [
          {id: 1, txHash: '1222345ab32cde'}
        ],
      }
    };

    Activity = $injector.get('Activity');
    coinify = $injector.get('coinify');
    sfox = $injector.get('sfox');
    unocoin = $injector.get('unocoin');
  }));

  describe('updateAllActivities', () =>
    it('should update all activities', inject(function (Activity) {
      spyOn(Activity, 'updateBtcTxActivities').and.callThrough();
      spyOn(Activity, 'updateEthTxActivities').and.callThrough();
      spyOn(Activity, 'updateBchTxActivities').and.callThrough();
      spyOn(Activity, 'updateLogActivities').and.callThrough();
      Activity.updateAllActivities();
      expect(Activity.updateBtcTxActivities).toHaveBeenCalled();
      expect(Activity.updateEthTxActivities).toHaveBeenCalled();
      expect(Activity.updateBchTxActivities).toHaveBeenCalled();
      expect(Activity.updateLogActivities).toHaveBeenCalled();
    })
    )
  );

  describe('time sort', () =>
    it('should be able to sort time', () => {
      let x = {};
      let y = {};
      x.time = 100;
      y.time = 900;

      let timeDiff = Activity.timeSort(x, y);
      expect(timeDiff).toBe(800);
    })
  );

  describe('factory', () => {
    it('should produce a tx object when type is 0', () => {
      let tx = Activity.messageFactory(MyWallet.wallet.txList.transactions()[0]);
      expect(tx).toEqual(jasmine.objectContaining({
        type: 0,
        icon: 'icon-tx',
        time: 25000,
        message: 'received BTC',
        amount: 1,
        labelClass: 'received'
      }));
    });

    it('should have the bought label for buy txs', () => {
      spyOn(coinify, 'getTxMethod').and.returnValue('buy');
      let tx = Activity.messageFactory(MyWallet.wallet.txList.transactions()[0]);
      expect(tx).toEqual(jasmine.objectContaining({
        type: 0,
        icon: 'icon-tx',
        time: 25000,
        message: 'Bought BTC',
        amount: 1,
        labelClass: 'received'
      }));
    });

    it('should have the sell label for sell txs', () => {
      spyOn(sfox, 'getTxMethod').and.returnValue('sell');
      let tx = Activity.messageFactory(MyWallet.wallet.txList.transactions()[0]);
      expect(tx).toEqual(jasmine.objectContaining({
        type: 0,
        icon: 'icon-tx',
        time: 25000,
        message: 'Sold BTC',
        amount: 1,
        labelClass: 'received'
      }));
    });

    it('should produce a log object when type is 4', () => {
      let log = Activity.logFactory({ time: 25, action: 'login' });
      expect(log).toEqual(jasmine.objectContaining({
        icon: 'ti-settings',
        time: 25,
        message: 'login',
        labelClass: 'login'
      }));
    });
  });
});
