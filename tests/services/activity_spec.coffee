describe "Activity", () ->
  Activity = undefined
  Wallet = undefined
  MyWallet = undefined

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector) ->
      Activity = $injector.get("Activity")
      Wallet = $injector.get("Wallet")
      MyWallet = $injector.get("MyWallet")

      MyWallet.wallet = {
        txList: 
          subscribe: () -> (() -> )
          transactions: () ->
            [{ result: 1, txType: 'received' }]
      }

  describe "updateAllActivities", ->
    it "should update all activities", inject((Activity) ->
      spyOn(Activity, "updateTxActivities").and.callThrough()
      spyOn(Activity, "updateLogActivities").and.callThrough()
      Activity.updateAllActivities()
      expect(Activity.updateTxActivities).toHaveBeenCalled()
      expect(Activity.updateLogActivities).toHaveBeenCalled()
    )

  describe "capitalize", ->
    it "should capitalize a string", ->
      str = 'capitalize me'
      str = Activity.capitalize(str)
      expect(str).toBe('Capitalize me')

  describe "time sort", ->
    it "should be able to sort time", ->
      x = {}
      y = {}
      x.time = 100;
      y.time = 900;

      timeDiff = Activity.timeSort(x, y)
      expect(timeDiff).toBe(800)
