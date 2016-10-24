describe "SettingsAddressesCtrl", ->
  $q = undefined
  scope = undefined
  Wallet = undefined
  Alerts = undefined
  MyBlockchainApi = undefined

  beforeEach angular.mock.module("walletApp")

  modal =
    open: ->

  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller, _$q_) ->
      $q = _$q_
      Wallet = $injector.get("Wallet")
      Alerts = $injector.get("Alerts")
      MyBlockchainApi = $injector.get("MyBlockchainApi")

      account =
        index: 0
        receiveIndex: 3
        receivingAddressesLabels: [{ index: 2, label: 'pending' }, { index: 1, label: 'labelled_address' }]
        receiveAddressAtIndex: (i) -> 'addr_at_index_' + i
        setLabelForReceivingAddress: (i) ->
        removeLabelForReceivingAddress: (i) ->

      Wallet.accounts = () -> [account]

      MyBlockchainApi.getBalances = (addrs) ->
        response = {}
        for addr in addrs
          response[addr] =
            address: addr
            n_tx: 1
            final_balance: 1000
        $q.resolve(response)

      scope = $rootScope.$new()
      $controller "SettingsAddressesCtrl",
        $scope: scope,
        $stateParams: { account: 0 }
        Wallet: Wallet
        $uibModal: modal
        paymentRequests: [{ address: '1aaa', label: 'pending', index: 2 }]


  it "should have payment requests", ->
    expect(scope.paymentRequests.length).toEqual(1)

  it "should calculate total number of used addresses", ->
    expect(scope.totalUsed).toEqual(3)

  it "should create the hd label map", ->
    expect(scope.hdLabels[1]).toEqual('labelled_address')

  it "should open modal to edit an account", ->
    spyOn(modal, "open")
    scope.editAccount(scope.account)
    expect(modal.open).toHaveBeenCalled()

  it "should open modal to reveal the xpub", ->
    spyOn(modal, "open")
    scope.revealXpub(scope.account)
    expect(modal.open).toHaveBeenCalled()

  describe "createAddress", ->
    it "should label the next receive address", ->
      spyOn(Wallet, 'addAddressForAccount').and.callThrough()
      scope.createAddress()
      expect(Wallet.addAddressForAccount).toHaveBeenCalledWith(scope.account)

    it "should add the new address to the paymentRequests array", ->
      expect(scope.paymentRequests.length).toEqual(1)
      scope.createAddress()
      scope.$digest()
      expect(scope.paymentRequests.length).toEqual(2)
      expect(scope.paymentRequests[1]).toEqual({ index: 3, address: 'addr_at_index_3', label: 'DEFAULT_NEW_ADDRESS_LABEL' })

  describe "removeAddressLabel", ->
    it "should prompt the user before removing the label", ->
      spyOn(Alerts, "confirm").and.callThrough()
      scope.removeAddressLabel()
      expect(Alerts.confirm).toHaveBeenCalled()

    it "should remove the address label", ->
      spyOn(Alerts, "confirm").and.returnValue($q.resolve())
      spyOn(scope.account, 'removeLabelForReceivingAddress')
      scope.removeAddressLabel(2, 0)
      scope.$digest()
      expect(scope.account.removeLabelForReceivingAddress).toHaveBeenCalledWith(2)
      expect(scope.paymentRequests.length).toEqual(0)

    it "should remove the address label for a used address", ->
      spyOn(Alerts, "confirm").and.returnValue($q.resolve())
      scope.usedAddresses = [{ index: 1, label: 'labelled_address' }]
      scope.removeAddressLabel(2, 0, true)
      scope.$digest()
      expect(scope.usedAddresses[0].label).toEqual(null)

  describe "toggleShowPast", ->
    it "should prompt the user to confirm when showing past addresses", ->
      spyOn(Alerts, 'confirm').and.returnValue($q.resolve())
      scope.toggleShowPast()
      expect(Alerts.confirm).toHaveBeenCalled()
      scope.$digest()
      expect(scope.showPast).toEqual(true)

    it "should toggle off", ->
      scope.showPast = true
      scope.toggleShowPast()
      expect(scope.showPast).toEqual(false)

  describe "setAddresses", ->
    it "should set addresses array to generated addresses for page", ->
      spyOn(scope, 'generatePage').and.returnValue([])
      scope.setAddresses(1)
      expect(scope.generatePage).toHaveBeenCalledWith(1)
      expect(scope.usedAddresses).toEqual([])

  describe "generatePage", ->
    beforeEach ->
      spyOn(MyBlockchainApi, 'getBalances').and.callThrough()

    it "should get the first page of addresses", ->
      page = scope.generatePage(1)
      expect(page.length).toEqual(3)
      expect(page[0].index).toEqual(3)

    it "should set the tx count and balance of each address", ->
      page = scope.generatePage(1)
      scope.$digest()
      expect(MyBlockchainApi.getBalances).toHaveBeenCalled()
      expect(page[0].ntxs).toEqual(1)
      expect(page[0].balance).toEqual(1000)

  describe "getIndexesForPage", ->
    it "should get the unused address indexes", ->
      indexes = scope.getIndexesForPage(1)
      expect(indexes).toEqual([3, 1, 0])

    it "should get the unused address indexes for different page length", ->
      scope.pageLength = 2
      indexes = scope.getIndexesForPage(1)
      expect(indexes).toEqual([3, 1])
      indexes = scope.getIndexesForPage(2)
      expect(indexes).toEqual([0])
