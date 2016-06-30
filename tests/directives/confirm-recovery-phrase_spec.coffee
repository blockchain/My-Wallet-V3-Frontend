describe "Confirm Recovery Phrase", ->
  $uibModal = undefined
  isoScope = undefined

  beforeEach module("walletApp")

  beforeEach inject(($injector, $compile, $rootScope, Wallet) ->
    $uibModal = $injector.get("$uibModal")

    element = $compile("<confirm-recovery-phrase></confirm-recovery-phrase>")($rootScope)
    $rootScope.$digest()
    isoScope = element.isolateScope()
    isoScope.$digest()
  )

  it "should open the confirm recovery phrase modal", ->
    spyOn($uibModal, "open")
    isoScope.confirmRecoveryPhrase()
    expect($uibModal.open).toHaveBeenCalled()
