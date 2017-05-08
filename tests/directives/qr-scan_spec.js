describe('qr-scan directive', function () {
  let isoScope;

  beforeEach(module('walletApp'));

  beforeEach(inject(function (_$compile_, _$rootScope_, $injector) {
    let $compile = _$compile_;
    let $rootScope = _$rootScope_;
    let Wallet = $injector.get('Wallet');

    Wallet.isValidAddress = () => true;
    Wallet.isValidPrivateKey = () => true;

    $rootScope.onScan = jasmine.createSpy();

    let element = $compile('<qr-scan on-scan="onScan"></qr-scan>')($rootScope);
    $rootScope.$digest();
    isoScope = element.isolateScope();
    return isoScope.$digest();
  })
  );

  it('should have a template url', () => expect(isoScope.popoverTemplate).toEqual('templates/qr-scan-popover.pug'));

  it('should display a warning when the camera cannot open', inject(function (Alerts) {
    spyOn(Alerts, 'displayWarning');
    isoScope.cameraOn = true;
    isoScope.onCameraError();
    expect(Alerts.displayWarning).toHaveBeenCalledWith('CAMERA_PERMISSION_DENIED');
    expect(isoScope.cameraOn).toEqual(false);
  })
  );

  it('should call onScan with the payment request', function () {
    isoScope.cameraOn = true;
    isoScope.onCameraResult('bitcoin:1JryFnzBdE8YRu6nDzZTZtyw9Sy4RbeABL');
    expect(isoScope.onScan).toHaveBeenCalledWith('bitcoin:1JryFnzBdE8YRu6nDzZTZtyw9Sy4RbeABL');
    expect(isoScope.scanComplete).toEqual(true);
    expect(isoScope.scanSuccess).toEqual(true);
  });

  it('should not call onScan when there is a scan error', inject(function (Wallet) {
    Wallet.isValidAddress = () => false;
    Wallet.isValidPrivateKey = () => false;
    isoScope.onCameraResult('notbitcoin:asdfasdfasdf');
    expect(isoScope.onScan).not.toHaveBeenCalled();
    expect(isoScope.scanComplete).toEqual(true);
    expect(isoScope.scanSuccess).toEqual(false);
  })
  );

  it('should reset after a scan', inject(function ($timeout) {
    isoScope.onCameraResult('bitcoin:1JryFnzBdE8YRu6nDzZTZtyw9Sy4RbeABL');
    $timeout.flush();
    expect(isoScope.cameraOn).toEqual(false);
    expect(isoScope.scanComplete).toEqual(false);
  })
  );

  it('should call a fake loader if the cameras toggling from off to on', inject(function ($timeout) {
    isoScope.cameraOn = true;
    isoScope.loader();
    expect(isoScope.loading).toBeFalsy();
    isoScope.cameraOn = false;
    isoScope.loader();
    expect(isoScope.loading).toBeTruthy();
    $timeout.flush();
    expect(isoScope.loading).toBeFalsy();
  })
  );
});
