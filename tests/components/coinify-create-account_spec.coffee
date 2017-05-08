describe "coinify-create-account.component", ->
  $q = undefined
  scope = undefined
  Wallet = undefined
  $rootScope = undefined
  buySell = undefined
  $rootScope = undefined
  $compile = undefined
  $templateCache = undefined
  $componentController = undefined

  handlers =
    viewInfo: false
    onSubmit: onSubmit
    onSuccess: onSuccess
    country: 'DK',

  onSuccess = () -> $q.resolve()
  onSubmit = () -> $q.resolve()

  getController = (bindings) ->
    scope = $rootScope.$new()
    ctrl = $componentController("coinifyCreateAccount", $scope: scope, bindings)
    template = $templateCache.get('partials/coinify/coinify-create-account.pug')
    $compile(template)(scope)
    ctrl

  beforeEach module("walletApp")
  beforeEach ->
    angular.mock.inject ($injector, _$rootScope_, _$compile_, _$templateCache_, _$componentController_) ->
      $rootScope = _$rootScope_
      $compile = _$compile_
      $templateCache = _$templateCache_
      $componentController = _$componentController_

      Wallet = $injector.get("Wallet")
      buySell = $injector.get("buySell")

  describe "showDanish", ->
    beforeEach ->
      ctrl = undefined

    it "should show Danish inputs if country and currency are DK and DKK", ->
      ctrl = getController(handlers)
      expect(ctrl.showDanish).toEqual(true)

  describe ".formatIban()", ->
    beforeEach ->
      ctrl = undefined

    it "should format the iban", ->
      ctrl = getController(handlers)
      ctrl.bank.account.number = 'ABCD EFGH 1234 56'
      ctrl.formatIban()
      expect(ctrl.bank.account.number).toEqual('ABCD EFGH 1234 56')

  describe ".turnOffIbanError()", ->
    beforeEach ->
      ctrl = undefined

    it "should set ibanError to false", ->
      ctrl = getController(handlers)
      ctrl.turnOffIbanError()
      expect(ctrl.ibanError).toBe(false)

  describe ".switchView()", ->
    beforeEach ->
      ctrl = undefined

    it "should switch viewInfo", ->
      ctrl = getController(handlers)
      ctrl.viewInfo = true
      ctrl.switchView()
      expect(ctrl.viewInfo).toBe(false)
