describe('Activity', () => {
  let Activity;
  let Wallet;
  let MyWallet;
  let buySell;

  beforeEach(angular.mock.module('walletApp'));

  beforeEach(() =>
    angular.mock.inject(function ($injector) {
      Activity = $injector.get('Activity');
      Wallet = $injector.get('Wallet');
      MyWallet = $injector.get('MyWallet');
      buySell = $injector.get('buySell');

      return MyWallet.wallet = {
        txList: {
          subscribe () { return (function () { }); },
          transactions () {
            return [{ amount: 1, time: 25, txType: 'received' }];
          }
        }
      };}));

  describe("updateAllActivities", () =>
    it("should update all activities", inject(function (Activity) {
      spyOn(Activity, "updateTxActivities").and.callThrough();
      spyOn(Activity, "updateLogActivities").and.callThrough();
      Activity.updateAllActivities();
      expect(Activity.updateTxActivities).toHaveBeenCalled();
      expect(Activity.updateLogActivities).toHaveBeenCalled();
    })
    )
  );

  describe("capitalize", () =>
    it('should capitalize a string', () => {
      let str = 'capitalize me';
      str = Activity.capitalize(str);
      expect(str).toBe('Capitalize me');
    })
  );

  describe("time sort", () =>
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
      let tx = Activity.factory(0, MyWallet.wallet.txList.transactions()[0]);
      expect(tx).toEqual(jasmine.objectContaining({
        title: 'TRANSACTION',
        icon: 'icon-tx',
        time: 25000,
        message: 'RECEIVED',
        amount: 1,
        labelClass: 'received'
      }));
    });

    it('should have the bought label for buy txs', () => {
      spyOn(buySell, 'getTxMethod').and.returnValue('buy');
      let tx = Activity.factory(0, MyWallet.wallet.txList.transactions()[0]);
      expect(tx).toEqual(jasmine.objectContaining({
        title: 'TRANSACTION',
        icon: 'icon-tx',
        time: 25000,
        message: 'BOUGHT',
        amount: 1,
        labelClass: 'received'
      }));
    });

    it('should produce a log object when type is 4', () => {
      let log = Activity.factory(4, { time: 25, action: 'login' });
      expect(log).toEqual(jasmine.objectContaining({
        title: 'LOG',
        icon: 'ti-settings',
        time: 25,
        message: 'Login',
        labelClass: 'login'
      }));
    });
  });
});
