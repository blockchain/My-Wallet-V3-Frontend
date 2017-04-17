describe "BuySellMasterController", ->
  $rootScope = undefined
  $controller = undefined
  $state = undefined
  MyWallet = undefined
  $cookies = undefined
  cta = undefined

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    external = {
      coinify: {}
      sfox: {}
    }

    angular.mock.inject ($injector, _$rootScope_, _$controller_, _$state_) ->
      $rootScope = _$rootScope_
      $controller = _$controller_
      $state = _$state_

      MyWallet = $injector.get("MyWallet")
      
      cta =
        setBuyCtaDismissed: () ->

      MyWallet.wallet =
        external: external

  getController = (profile, accounts, quote) ->
    $scope = $rootScope.$new()
    
    $controller "BuySellMasterController",
      cta: cta
      $scope: $scope
      $uibModalInstance: { close: (->) dismiss: (->) }
      exchange: { profile: profile }

  it "should set buy cta dismissed", ->
    spyOn(cta, 'setBuyCtaDismissed')
    ctrl = getController()
    expect(cta.setBuyCtaDismissed).toHaveBeenCalled()
    
  describe ".resolveState()", ->
    
    it "should resolve to .select if user has no exchange account", ->
      ctrl = getController()
      expect(ctrl.resolveState()).toBe('.select')
    
    it "should resolve to .coinify if user has a coinify account", ->
      MyWallet.wallet.external.coinify.user = 1
      ctrl = getController()
      expect(ctrl.resolveState()).toBe('.coinify')
    
    it "should resolve to .sfox if user has a sfox account", ->
      MyWallet.wallet.external.sfox.user = 1
      ctrl = getController()
      expect(ctrl.resolveState()).toBe('.sfox')
