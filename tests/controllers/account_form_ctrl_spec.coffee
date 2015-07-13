describe "AccountFormCtrl", ->
  scope = undefined

  modalInstance =
    close: ->
    dismiss: ->

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller, $compile) ->
      Wallet = $injector.get("Wallet")
      MyWallet = $injector.get("MyWallet")

      scope = $rootScope.$new()

      $controller "AccountFormCtrl",
        $scope: scope
        $stateParams: {}
        $modalInstance: modalInstance
        account: Wallet.accounts[0]

      element = angular.element(
        '<form role="form" name="accountForm" novalidate>' +
        '<input type="text" name="new" ng-model="fields.name" is-valid="validate(fields.name)" maxlength="17" required />' +
        '</form>'
      )
      scope.model = { fields: { name: '' } }
      $compile(element)(scope)

      scope.$digest()

      return

    return

  describe "creation", ->

    beforeEach ->
      scope.fields.name = 'New Account'

    it "should be created", inject((Wallet) ->
      before = Wallet.accounts.length
      scope.createAccount()
      expect(Wallet.accounts.length).toBe(before + 1)
    )

    it "should have a name", inject((Wallet) ->
        scope.createAccount()
        expect(Wallet.accounts[Wallet.accounts.length - 1].label).toBe("New Account")
    )

    it "should show a confirmation modal", inject(($modal)->
      spyOn($modal, "open").and.callThrough()
      scope.createAccount()
      expect($modal.open).toHaveBeenCalled()
      expect($modal.open.calls.argsFor(0)[0].windowClass).toEqual("notification-modal")
    )

  describe "rename", ->

    it "original name should be shown", ->
      expect(scope.fields.name).toBe("Savings")

    it "should save the new name",  inject((Wallet) ->
      scope.fields.name = "New Name"
      scope.updateAccount()
      expect(Wallet.accounts[0].label).toBe("New Name")
    )

  describe "validate", ->

    beforeEach ->
      scope.fields.name = 'Valid Name'
      scope.$apply()

    it "should not have a null name", ->
      expect(scope.accountForm.$valid).toBe(true)
      scope.fields.name = null
      scope.$apply()
      expect(scope.accountForm.$valid).toBe(false)

    it "should not have a name of zero length", ->
      expect(scope.accountForm.$valid).toBe(true)
      scope.fields.name = ''
      scope.$apply()
      expect(scope.accountForm.$valid).toBe(false)

    it "should not have a name longer than 17 characters", ->
      expect(scope.accountForm.$valid).toBe(true)
      scope.fields.name = 'abcdefghijklmnopqr'
      scope.$apply()
      expect(scope.accountForm.$valid).toBe(false)

    it "should not create an account with an existing account name", ->
      expect(scope.isNameUnused 'Savings').toBe(false)
      expect(scope.isNameUnused 'New Account').toBe(true)
