describe "sell-bank-link.component", ->
  $q = undefined
  scope = undefined
  Wallet = undefined
  $rootScope = undefined
  buySell = undefined
  $rootScope = undefined
  $compile = undefined
  $templateCache = undefined
  $componentController = undefined

  accounts = [
    {
      _account : {
        id: 12345,
        type: 'sepa',
        account: {
          number: 123456789,
          bic: '123abc'
        },
        bank: {
          address: {
            country: 'GB'
          }
        },
        holder: {
          name: 'John Smith',
          address: {
            country: 'GB'
          }
        }
      }
    }
  ]

  selectedBankAccount = 'Bank 1'

  handlers =
    accounts: accounts
    selectedBankAccount: selectedBankAccount

  getController = (bindings) ->
    scope = $rootScope.$new()
    ctrl = $componentController("sellBankLink", $scope: scope, bindings)
    template = $templateCache.get('partials/coinify/bank-link.pug')
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

  describe ".selecting", ->

    beforeEach ->
      ctrl = undefined

    it "change if selecting", ->
      ctrl = getController(handlers)
      ctrl.bankLinkEdit()
      scope.$digest()
      expect(ctrl.selecting).toEqual(false)

  describe ".handleAccountDelete", ->
    beforeEach ->
      ctrl = undefined

    it "should remove the account from the accounts array", ->
      ctrl = getController(handlers)
      account = ctrl.accounts[0]['_account']
      ctrl.handleAccountDelete(account)
      scope.$digest()
      expect(ctrl.accounts).toEqual([])

  describe ".hideWhenNoAccounts", ->
    beforeEach ->
      ctrl = undefined

    it "should be true when there are no accounts", ->
      ctrl = getController(handlers)
      ctrl.accounts = []
      expect(ctrl.hideWhenNoAccounts).toEqual(true)

  describe "$onChanges", ->
    beforeEach ->
      ctrl = undefined

    it "should reassign selectedBankAccount", ->
      ctrl = getController(handlers)
      ctrl.$onChanges(selectedBankAccount: currentValue: 'Bank 2')
      expect(ctrl.selectedBankAccount).toEqual('Bank 2')
