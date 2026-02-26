/* eslint-disable semi */
describe('MobileLoginController', () => {
  let $rootScope
  let $controller
  let $timeout
  let Wallet
  let MyWallet

  let func = jasmine.any(Function)

  beforeEach(angular.mock.module('walletApp'))

  beforeEach(() =>
    angular.mock.inject(($injector, $httpBackend, $q, _$rootScope_, _$controller_) => {
      $rootScope = _$rootScope_
      $controller = _$controller_
      $timeout = $injector.get('$timeout')

      $httpBackend.whenGET('/Resources/wallet-options.json').respond();
      Wallet = $injector.get('Wallet')
      MyWallet = $injector.get('MyWallet')

      MyWallet.parsePairingCode = (code) =>
        code === 'pairing_code'
          ? $q.resolve({ guid: 'guid', password: 'pass', sharedKey: 'sk' })
          : $q.reject('bad_code')
    })
  )

  let getControllerScope = () => {
    let scope = $rootScope.$new()
    $controller('MobileLoginController', { $scope: scope })
    return scope
  }

  describe('.getBoxColor()', () => {
    let scope
    beforeEach(() => { scope = getControllerScope() })

    it('should be empty string by default', () => {
      expect(scope.getBoxColor()).toEqual('')
    })

    it('should be success if scan is complete', () => {
      scope.state.scanComplete = true
      expect(scope.getBoxColor()).toEqual('success')
    })

    it('should be error if scan failed', () => {
      scope.state.scanFailed = true
      expect(scope.getBoxColor()).toEqual('error')
    })

    it('should be error if camera permission was denied', () => {
      scope.state.permissionDenied = true
      expect(scope.getBoxColor()).toEqual('error')
    })
  })

  describe('.onScanError()', () => {
    let scope
    beforeEach(() => { scope = getControllerScope() })

    it('should handle a permission denied error', () => {
      scope.onScanError({ name: 'PermissionDeniedError' })
      $timeout.flush()
      expect(scope.state.permissionDenied).toEqual(true)
    })

    it('should turn the scanner off', () => {
      scope.onScanError()
      expect(scope.state.scannerOn).toEqual(false)
    })
  })

  describe('.onScanResult()', () => {
    let scope
    beforeEach(() => { scope = getControllerScope() })

    it('should try to parse the result as a pairing code', () => {
      spyOn(MyWallet, 'parsePairingCode')
      scope.onScanResult('pairing_code')
      expect(MyWallet.parsePairingCode).toHaveBeenCalledWith('pairing_code')
    })

    it('should log the user in after a successful scan', () => {
      spyOn(Wallet, 'login')
      scope.onScanResult('pairing_code')
      scope.$digest()
      expect(scope.state.scanComplete).toEqual(true)
      expect(Wallet.login).toHaveBeenCalledWith('guid', 'pass', null, null, func, func, 'sk')
      expect(scope.state.scannerOn).toEqual(false)
    })

    it('should set scanFailed after a failed scan', () => {
      spyOn(Wallet, 'login')
      scope.onScanResult('invalid_code')
      scope.$digest()
      expect(scope.state.scanComplete).toEqual(false)
      expect(Wallet.login).not.toHaveBeenCalled()
      expect(scope.state.scanFailed).toEqual(true)
      expect(scope.state.scannerOn).toEqual(false)
    })
  })

  describe('.retryScan()', () => {
    let scope
    beforeEach(() => { scope = getControllerScope() })

    it('should turn the scanner on', () => {
      scope.state.scannerOn = false
      scope.state.scanFailed = true
      scope.retryScan()
      expect(scope.state.scannerOn).toEqual(true)
      expect(scope.state.scanFailed).toEqual(false)
    })
  })
})
