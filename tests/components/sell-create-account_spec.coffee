describe "sell-create-account.component", ->
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
      id: 54321,
      type: 'sepa',
      account: {
        number: 'ABCDEFGH123456',
        bic: 'abc123',
        currency: 'EUR'
      },
      bank: {
        address: {
          country: 'FR'
        }
      },
      holder: {
        name: 'John Smith',
        address: {
          country: 'FR'
        }
      }
    }
  ]

  transaction = {
    currency: {
      code: "DKK"
    }
  }

  onSuccess = (bankId) -> $q.resolve()

  paymentAccount = {
    addBankAccount: (bankAccount) -> $q.resolve('12345').then(ctrl.onSuccess({bankId: '12345'}))
  }

  sepaCountries = [
                  {name: 'Austria', code: 'AT'},
                  {name: 'Belgium', code: 'BE'},
                  {name: 'Bulgaria', code: 'BG'},
                  {name: 'Croatia', code: 'HR'},
                  {name: 'Cyprus', code: 'CY'},
                  {name: 'Czech Republic', code: 'CZ'},
                  {name: 'Denmark', code: 'DK'},
                  {name: 'Estonia', code: 'EE'},
                  {name: 'Finland', code: 'FI'},
                  {name: 'France', code: 'FR'}]


  bankAccount = {
    account: {
      number: "1234ABCD5678EFGH",
      currency :'EUR'
    },
    holder: {
      name: 'PW'
    },
    bank: {
      address: {
        country: 'ES'
      }
    }
  }

  handlers =
    accounts: accounts,
    sepaCountries: sepaCountries,
    transaction: transaction
    bankAccount: bankAccount
    paymentAccount: paymentAccount
    onSuccess: onSuccess
    country: 'DK',


  getController = (bindings) ->
    scope = $rootScope.$new()
    ctrl = $componentController("sellCreateAccount", $scope: scope, bindings)
    template = $templateCache.get('partials/coinify/sell-create-account.pug')
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

  describe ".changeCountry()", ->
    beforeEach ->
      ctrl = undefined

    it "should change the country", ->
      ctrl = getController(handlers)
      ctrl.changeCountry("FR")
      expect(ctrl.country).toEqual("FR")

  describe ".createBankAccount()", ->
    beforeEach ->
      ctrl = undefined

    it "should set the status to waiting", ->
      ctrl = getController(handlers)
      ctrl.createBankAccount()
      expect(ctrl.status.waiting).toEqual(true)

    it "should check for a bank account and not call if one of the checks fails", ->
      ctrl = getController(handlers)
      ctrl.bankAccount.holder.name = 'Snoop Dog'
      ctrl.bankAccount.bank.address.country = undefined
      spyOn(ctrl.paymentAccount, 'addBankAccount')
      ctrl.createBankAccount()
      $rootScope.$digest()
      expect(ctrl.paymentAccount.addBankAccount).not.toHaveBeenCalled()

    it "should call paymentAccount.addBankAccount()", ->
      ctrl = getController(handlers)
      ctrl.bankAccount.holder.name = 'Snoop Dog'
      spyOn(ctrl.paymentAccount, 'addBankAccount')
      ctrl.createBankAccount()
      expect(ctrl.paymentAccount.addBankAccount).toHaveBeenCalled()

  describe ".formatIban()", ->
    beforeEach ->
      ctrl = undefined

    it "should format the iban", ->
      ctrl = getController(handlers)
      ctrl.bankAccount.account.number = ctrl.accounts[0].account.number
      ctrl.formatIban()
      expect(ctrl.bankAccount.account.number).toEqual('ABCD EFGH 1234 56')

  describe ".isDisabled()", ->
    beforeEach ->
      ctrl = getController(handlers)
      ctrl.viewInfo = true

    it "should not disable", ->
      ctrl = getController(handlers)
      ctrl.bankAccount.account.number = '12345'
      ctrl.bankAccount.account.bic = 'abcdefgh'
      result = ctrl.isDisabled()
      expect(result).toEqual(false)
