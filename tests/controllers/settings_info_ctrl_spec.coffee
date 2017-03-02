describe "SettingsInfoCtrl", ->
  scope = undefined
  Wallet = undefined
  Alerts = undefined
  $q = undefined

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller, _$q_) ->
      Wallet = $injector.get("Wallet")
      Alerts = $injector.get("Alerts")
      $q = _$q_

      Wallet.user.guid = "user_guid"
      Wallet.user.alias = "user_alias"
      Wallet.makePairingCode = (success, error) ->
        if scope.pairingCode then error() else success("code")
      Wallet.removeAlias = () -> $q.resolve()

      scope = $rootScope.$new()

      $controller "SettingsInfoCtrl",
        $scope: scope

      scope.$digest()

  describe "remove alias", ->
    it "should ask to confirm", ->
      spyOn(Alerts, 'confirm').and.callThrough()
      scope.removeAlias()
      expect(Alerts.confirm).toHaveBeenCalledWith(jasmine.any(String), props: { 'UID': 'user_guid' })

    it "should remove the alias", ->
      spyOn(Alerts, 'confirm').and.returnValue($q.resolve())
      spyOn(Wallet, 'removeAlias').and.returnValue($q.resolve())
      scope.removeAlias()
      scope.$digest()
      expect(Wallet.removeAlias).toHaveBeenCalled()
      expect(scope.loading.alias).toEqual(false)

  describe "pairing code", ->
    it "should show if valid", ->
      scope.showPairingCode()
      scope.$digest()
      expect(scope.pairingCode).toEqual("code")
      expect(scope.loading.code).toEqual(false)

    it "should display an error when show failed", ->
      spyOn(Alerts, "displayError")
      scope.pairingCode = "code"
      scope.showPairingCode()
      scope.$digest()
      expect(Alerts.displayError).toHaveBeenCalledWith('SHOW_PAIRING_CODE_FAIL')
      expect(scope.loading.code).toEqual(false)

    it "should hide", ->
      scope.pairingCode = "code"
      scope.hidePairingCode()
      expect(scope.pairingCode).toEqual(null)
