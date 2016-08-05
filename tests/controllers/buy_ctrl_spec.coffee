describe "BuyCtrl", ->
  scope = undefined
  Alerts = undefined
  $rootScope = undefined
  $controller = undefined
  $q = undefined

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, _$rootScope_, _$controller_, _$q_) ->
      $rootScope = _$rootScope_
      $controller = _$controller_
      $q = _$q_

      Wallet = $injector.get("Wallet")
      MyWallet = $injector.get("MyWallet")
      Alerts = $injector.get("Alerts")

      MyWallet.wallet = {}
      MyWallet.wallet.accountInfo = {}
      MyWallet.wallet.hdwallet = { accounts: [{ label: 'My Bitcoin Wallet '}] }

  getControllerScope = (params = {}) ->
    scope = $rootScope.$new()
    $controller "BuyCtrl",
      $scope: scope,
      $uibModalInstance: params.modalInstance ? { close: (->) dismiss: (->) }
      exchange: params.exchange ? {}
      trades: params.trades ? []
      fiat: params.fiat ? 0
      trade: params.trade ? false
      bitcoinReceived: params.bitcoinReceived ? false
    scope

  describe "nextStep", ->
    it "should switch to amount step", ->
      scope = getControllerScope()
      scope.nextStep()
      expect(scope.onStep('amount')).toEqual(true)

    it "should switch to select-country step", ->
      scope.transaction.fiat = 1
      scope.nextStep()
      expect(scope.onStep('select-country')).toEqual(true)

    it "should switch to email step", ->
      scope.fields.countryCode = 'GB'
      scope.nextStep()
      expect(scope.onStep('email')).toEqual(true)

    it "shuold switch to accept-terms step", ->
      scope.user.isEmailVerified = true
      scope.nextStep()
      expect(scope.onStep('accept-terms')).toEqual(true)

    it "should switch to summary step", ->
      scope.exchange.user = {}
      scope.nextStep()
      expect(scope.onStep('summary')).toEqual(true)

    it "should switch to trade-formatted step", ->
      scope.trade = {}
      scope.nextStep()
      expect(scope.onStep('trade-formatted')).toEqual(true)

    it "should switch to trade-complete step", ->
      scope.paymentInfo = {}
      scope.nextStep()
      expect(scope.onStep('trade-complete')).toEqual(true)

    it "should switch to pending step", ->
      scope.formattedTrade = {}
      scope.nextStep()
      expect(scope.onStep('pending')).toEqual(true)

    it "should switch to success step", ->
      scope.bitcoinReceived = true
      scope.nextStep()
      expect(scope.onStep('success')).toEqual(true)

  describe "close", ->
    beforeEach ->
      spyOn(Alerts, 'confirm').and.callThrough()
      scope = getControllerScope()

    it "should confirm when leaving amount selection", ->
      scope.goTo('amount')
      scope.close()
      expect(Alerts.confirm).toHaveBeenCalledWith('CONFIRM_CLOSE_AMT', {action: 'CLOSE'})

    it "should confirm close when acct is true", ->
      scope.goTo('select-country')
      scope.close(true)
      expect(Alerts.confirm).toHaveBeenCalledWith('CONFIRM_CLOSE', {action: 'IM_DONE'})

    it "should confirm close account otherwise", ->
      scope.goTo('select-country')
      scope.close()
      expect(Alerts.confirm).toHaveBeenCalledWith('CONFIRM_CLOSE_ACCT', {action: 'IM_DONE'})
