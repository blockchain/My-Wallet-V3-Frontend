describe "Confirm Recovery Phrase", ->
  isoScope = undefined
  $q = undefined
  $uibModal = undefined
  Wallet = undefined
  Alerts = undefined


  beforeEach module('walletDirectives');
  beforeEach module("walletApp")

  beforeEach inject(($injector, $compile, $rootScope) ->
    $q = $injector.get('$q')
    $uibModal = $injector.get("$uibModal")
    Wallet = $injector.get("Wallet")
    Alerts = $injector.get("Alerts")

    element = $compile("<confirm-recovery-phrase></confirm-recovery-phrase>")($rootScope)
    $rootScope.$digest()
    isoScope = element.isolateScope()
    isoScope.$digest()

    spyOn(Alerts, "prompt").and.returnValue($q.resolve('asdf'))
    spyOn($uibModal, "open").and.callThrough()
  )

  it "should open when second pw is enabled", ->
    Wallet.settings.secondPassword = true
    isoScope.confirmRecoveryPhrase()
    expect($uibModal.open).toHaveBeenCalled()

  it "should prompt for main password when second pw is not enabled", ->
    isoScope.confirmRecoveryPhrase()
    expect(Alerts.prompt).toHaveBeenCalled()

  it "should validate the main password", ->
    spyOn(Wallet, "isCorrectMainPassword").and.returnValue(true)

    isoScope.confirmRecoveryPhrase()
    expect(Alerts.prompt).toHaveBeenCalled()

    isoScope.$digest()
    expect($uibModal.open).toHaveBeenCalled()

  it "should display an error and retry if the main password was incorrect", ->
    spyOn(Alerts, "displayError").and.callThrough()
    spyOn(Wallet, "isCorrectMainPassword").and.returnValue(false)

    isoScope.confirmRecoveryPhrase()
    spyOn(isoScope, "confirmRecoveryPhrase")

    expect(Alerts.prompt).toHaveBeenCalled()
    isoScope.$digest()

    expect(Alerts.displayError).toHaveBeenCalled()
    expect(isoScope.confirmRecoveryPhrase).toHaveBeenCalled()

  it "should not prompt backup recovery phrase modal if promptBackup is not set", ->
    spyOn(isoScope, 'confirmRecoveryPhrase')
    expect(isoScope.confirmRecoveryPhrase).not.toHaveBeenCalled()
