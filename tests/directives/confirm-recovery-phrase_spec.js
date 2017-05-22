describe('Confirm Recovery Phrase', () => {
  let isoScope;
  let $q;
  let $uibModal;
  let Wallet;
  let Alerts;

  beforeEach(module('walletDirectives'));
  
  beforeEach(module('walletApp'));

  beforeEach(inject(function ($injector, $compile, $rootScope) {
    $q = $injector.get('$q');
    $uibModal = $injector.get('$uibModal');
    Wallet = $injector.get('Wallet');
    Alerts = $injector.get('Alerts');

    spyOn(Alerts, 'prompt').and.returnValue($q.resolve('asdf'));
    spyOn($uibModal, "open").and.callThrough();

    let element = $compile("<confirm-recovery-phrase></confirm-recovery-phrase>")($rootScope);
    $rootScope.$digest();
    isoScope = element.isolateScope();
    return isoScope.$digest();
  })
  );

  it('should open', () => {
    isoScope.confirmRecoveryPhrase();
    expect($uibModal.open).toHaveBeenCalled();
  });

  it('should not prompt backup recovery phrase modal if promptBackup is not set', () => expect($uibModal.open).not.toHaveBeenCalled());
});
