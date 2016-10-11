describe "ExportHistoryController", ->
  $rootScope = undefined
  $controller = undefined
  Wallet = undefined
  scope = undefined

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, _$rootScope_, _$controller_) ->
      $rootScope = _$rootScope_
      $controller = _$controller_
      $q = $injector.get("$q")
      Wallet = $injector.get("Wallet")

      Wallet.legacyAddresses = () -> [
        { address: 'some_address', archived: false, isWatchOnly: false, label: 'some_label' }
        { address: 'watch_address', archived: false, isWatchOnly: true }
        { address: 'other_address', archived: true, isWatchOnly: false }
      ]

      Wallet.accounts = () -> [
        { label: "Checking", index: 0, archived: false, balance: 1, extendedPublicKey: 'xpub1' }
        { label: "Savings", index: 1, archived: false, balance: 1, extendedPublicKey: 'xpub2' }
        { label: "Something", index: 2, archived: true, extendedPublicKey: 'xpub3' }
      ]

      Wallet.exportHistory = () -> $q.resolve()

  getCtrlScope = (activeIndex) ->
    scope = $rootScope.$new()
    $controller "ExportHistoryController",
      $scope: scope
      activeIndex: activeIndex
    scope.$digest()
    scope

  it "should create list of export targets", ->
    scope = getCtrlScope('')
    expect(scope.targets.length).toEqual(4)

  it "should have the correct active target count", ->
    scope = getCtrlScope('')
    expect(scope.activeCount).toEqual(4)

  it "should set the target to all when only one active is found", ->
    spyOn(Wallet, 'legacyAddresses').and.returnValue([])
    spyOn(Wallet, 'accounts').and.returnValue([{ label: "Checking", index: 0, archived: false, balance: 1, extendedPublicKey: 'xpub1' }])
    scope = getCtrlScope('')
    expect(scope.active.address).toEqual(['xpub1'])

  describe "activeIndex", ->
    it "should set all when ''", ->
      scope = getCtrlScope('')
      expect(scope.active.address).toEqual(['xpub1', 'xpub2', 'some_address', 'watch_address'])

    it "should set all addresses when 'imported'", ->
      scope = getCtrlScope('imported')
      expect(scope.active.address).toEqual(['some_address', 'watch_address'])

    it "should set the right account", ->
      scope = getCtrlScope('1')
      expect(scope.active.xpub).toEqual('xpub2')

  describe "submit", ->
    beforeEach ->
      scope = getCtrlScope('')
      spyOn(Wallet, 'exportHistory').and.callThrough()
      spyOn(scope, 'formatDate').and.returnValue('date')

    it "should format the dates", ->
      scope.submit()
      expect(scope.formatDate).toHaveBeenCalledTimes(2)

    it "should call exportHistory", ->
      scope.submit()
      expect(Wallet.exportHistory).toHaveBeenCalledWith('date', 'date', ['xpub1', 'xpub2', 'some_address', 'watch_address'])

    it "should toggle busy status", ->
      scope.submit()
      expect(scope.busy).toEqual(true)
      scope.$digest()
      expect(scope.busy).toEqual(false)

  describe "formatFilename", ->
    beforeEach ->
      scope = getCtrlScope('')

    it "should format correctly", ->
      scope.start.date = new Date('11/24/1995')
      scope.end.date = new Date('10/03/1998')
      expect(scope.formatFilename()).toEqual('history-24-11-1995-03-10-1998.csv')
