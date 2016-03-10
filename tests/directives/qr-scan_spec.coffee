describe 'qr-scan directive', ->
  isoScope = undefined

  beforeEach module('walletApp')

  beforeEach inject((_$compile_, _$rootScope_, $injector) ->
    $compile = _$compile_
    $rootScope = _$rootScope_
    Wallet = $injector.get('Wallet')

    Wallet.isValidAddress = () -> true
    Wallet.isValidPrivateKey = () -> true

    $rootScope.onScan = jasmine.createSpy()

    element = $compile('<qr-scan on-scan="onScan"></qr-scan>')($rootScope)
    $rootScope.$digest()
    isoScope = element.isolateScope()
    isoScope.$digest()
  )

  it 'should have a template url', ->
    expect(isoScope.popoverTemplate).toEqual('templates/qr-scan-popover.jade')

  it 'should display a warning when the camera cannot open', inject((Alerts) ->
    spyOn(Alerts, 'displayWarning')
    isoScope.cameraOn = true
    isoScope.onCameraError()
    expect(Alerts.displayWarning).toHaveBeenCalledWith('CAMERA_PERMISSION_DENIED')
    expect(isoScope.cameraOn).toEqual(false)
  )

  it 'should call onScan with the payment request', ->
    isoScope.cameraOn = true
    isoScope.onCameraResult('bitcoin:1JryFnzBdE8YRu6nDzZTZtyw9Sy4RbeABL')
    expect(isoScope.onScan).toHaveBeenCalledWith('bitcoin:1JryFnzBdE8YRu6nDzZTZtyw9Sy4RbeABL')
    expect(isoScope.scanComplete).toEqual(true)
    expect(isoScope.scanSuccess).toEqual(true)

  it 'should not call onScan when there is a scan error', inject((Wallet) ->
    Wallet.isValidAddress = () -> false
    Wallet.isValidPrivateKey = () -> false
    isoScope.onCameraResult('notbitcoin:asdfasdfasdf')
    expect(isoScope.onScan).not.toHaveBeenCalled()
    expect(isoScope.scanComplete).toEqual(true)
    expect(isoScope.scanSuccess).toEqual(false)
  )

  it 'should reset after a scan', inject(($timeout) ->
    isoScope.onCameraResult('bitcoin:1JryFnzBdE8YRu6nDzZTZtyw9Sy4RbeABL')
    $timeout.flush()
    expect(isoScope.cameraOn).toEqual(false)
    expect(isoScope.scanComplete).toEqual(false)
  )
