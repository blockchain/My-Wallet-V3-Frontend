describe "SfoxLinkController", ->
  scope = undefined
  Wallet = undefined
  $rootScope = undefined
  $controller = undefined
  $q = undefined
  bankAccounts = undefined

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, _$rootScope_, _$controller_, _$q_, _$timeout_) ->
      $rootScope = _$rootScope_
      $controller = _$controller_
      $q = _$q_

      Wallet = $injector.get("Wallet")
      modals = $injector.get("modals")

      bankAccounts = [{
        "institution_type": "fake_institution",
        "meta": {
          "name": "Plaid Savings",
          "number": "9606"
        },
        "balance": {
          "current": 1274.93,
          "available": 1203.42
        }
      }]

  getControllerScope = (params = {}) ->
    scope = $rootScope.$new()
    scope.vm = 
      exchange:
        profile: {}
        getBuyMethods: () -> $q.resolve().then(scope.state.accounts = ['1']).finally(scope.free())
        bankLink:
          getAccounts: () -> $q.resolve(bankAccounts).then(scope.state.bankAccounts = bankAccounts).finally(scope.free())
          setAccount: () -> $q.resolve(bankAccounts).then(account = bankAccounts[0]).then(scope.vm.exchange.getBuyMethods)
      goTo: (state) ->

    $controller "SfoxLinkController",
      $scope: scope
    scope

  beforeEach ->
    scope = getControllerScope()
    $rootScope.$digest()

  describe "link()", ->

    it "should call lock", ->
      spyOn(scope, 'lock');
      scope.link()
      expect(scope.lock).toHaveBeenCalled()

    it "should get possible buy methods", ->
      spyOn(scope.vm.exchange, 'getBuyMethods')
      scope.link()
      expect(scope.vm.exchange.getBuyMethods).toHaveBeenCalled()

    it "should set an account", ->
      scope.link()
      expect(scope.state.accounts).toBeDefined()

    it "should call free", ->
      spyOn(scope, 'free');
      scope.link()
      expect(scope.free).toHaveBeenCalled()      

  describe "verify()", ->
    beforeEach ->
      scope.state.accounts = [
        verify: () -> $q.resolve().then(scope.vm.goTo('buy')).finally(scope.free)
      ]

    it "should call lock", ->
      spyOn(scope, 'lock');
      scope.verify()
      expect(scope.lock).toHaveBeenCalled()

    it "should goTo buy", ->
      spyOn(scope.vm, 'goTo')
      scope.verify()
      expect(scope.vm.goTo).toHaveBeenCalled()

    it "should call free", ->
      spyOn(scope, 'free')
      scope.verify()
      scope.$digest()
      expect(scope.free).toHaveBeenCalled()

  describe "getBankAccounts()", ->
    it "should get a list of bank accounts", ->
      spyOn(scope.vm.exchange.bankLink, 'getAccounts')
      scope.getBankAccounts()
      expect(scope.vm.exchange.bankLink.getAccounts).toHaveBeenCalled()

    it "should set bank accounts", ->
      scope.getBankAccounts()
      scope.$digest()
      expect(scope.state.bankAccounts).toBeDefined()

    it "should auto select the first bank account", ->
      scope.getBankAccounts()
      scope.$digest()
      expect(scope.fields.bankAccount).toBe(bankAccounts[0])

  describe "setBankAccount()", ->
    beforeEach ->
      scope.getBankAccounts()
      scope.$digest()

    it "should set a bank account obj", ->
      spyOn(scope.vm.exchange.bankLink, 'setAccount')
      scope.setBankAccount()
      expect(scope.vm.exchange.bankLink.setAccount).toHaveBeenCalled()

  describe "enablePlaid()", ->
    it "should enable Plaid", ->
      scope.enablePlaid()
      expect(scope.state.plaid.enabled).toBe(true)

  describe "disablePlaid()", ->
    it "should disable Plaid", ->
      scope.disablePlaid()
      expect(scope.state.plaid.enabled).toBe(undefined)
