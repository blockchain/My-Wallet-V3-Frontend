describe "AccountFormCtrl", ->
  Wallet = undefined
  scope = undefined
  accounts = [{label: 'Savings'}, {label: 'Party Money'}]

  modalInstance =
    close: ->
    dismiss: ->

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector) ->
      Wallet = $injector.get("Wallet")
      MyWallet = $injector.get("MyWallet")
      Wallet.my.browserCheck = () -> true

      Wallet.accounts = () -> accounts

      Wallet.askForSecondPasswordIfNeeded = () ->
        return {
          then: (fn) -> fn(); return { catch: (-> ) }
        }

      Wallet.my.fetchMoreTransactionsForAll = (success,error,allTransactionsLoaded) ->
        success()

      MyWallet.wallet = {
        isDoubleEncrypted: false

        newAccount: (label) ->
          accounts.push { label: label }
          return

        getHistory: () ->
          then: () ->
            then: () ->

        txList:
          fetchTxs: () ->
      }

  beforeEach ->
    angular.mock.inject ($rootScope, $controller, $compile, $templateCache) ->
      scope = $rootScope.$new()
      template = $templateCache.get('partials/account-form.jade')

      $controller "AccountFormCtrl",
        $scope: scope
        $stateParams: {}
        $uibModalInstance: modalInstance
        account: Wallet.accounts()[0]

      scope.model = { status: {} }
      $compile(template)(scope)

      scope.$digest()

  beforeEach -> accounts.splice(2); accounts[0].label = 'Savings'

  describe "creation", ->

    beforeEach ->
      scope.name = 'New Account'

    it "should be created", inject((Wallet) ->
      before = Wallet.accounts().length
      scope.createAccount()
      scope.$digest()
      expect(Wallet.accounts().length).toBe(before + 1)
    )

    it "should have a name", inject((Wallet) ->
        scope.createAccount()
        scope.$digest()
        expect(Wallet.accounts()[Wallet.accounts().length - 1].label).toBe("New Account")
    )

  describe "rename", ->

    it "original name should be shown", ->
      expect(scope.name).toBe("Savings")

    it "should save the new name",  inject((Wallet) ->
      scope.name = "New Name"
      scope.updateAccount()
      expect(Wallet.accounts()[0].label).toBe("New Name")
    )

  describe "validate", ->

    beforeEach ->
      scope.name = 'Valid Name'
      scope.$apply()

    it "should not have a null name", ->
      expect(scope.accountForm.$valid).toBe(true)
      scope.name = null
      scope.$apply()
      expect(scope.accountForm.$valid).toBe(false)

    it "should not have a name of zero length", ->
      expect(scope.accountForm.$valid).toBe(true)
      scope.name = ''
      scope.$apply()
      expect(scope.accountForm.$valid).toBe(false)

    it "should not have a name longer than 17 characters", ->
      expect(scope.accountForm.$valid).toBe(true)
      scope.name = 'abcdefghijklmnopqr'
      scope.$apply()
      expect(scope.accountForm.$valid).toBe(false)

    it "should not create an account with an existing account name", ->
      expect(scope.isNameUnused 'Savings').toBe(false)
      expect(scope.isNameUnused 'New Account').toBe(true)
