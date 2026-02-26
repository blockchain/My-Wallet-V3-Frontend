describe('EthMewSweepController', () => {
  let scope;
  let $rootScope;
  let $controller;
  let Ethereum;

  beforeEach(angular.mock.module('walletApp'));

  beforeEach(function () {
    return angular.mock.inject(function ($injector, _$rootScope_, _$controller_, _$state_, $httpBackend) {
      $rootScope = _$rootScope_;
      $controller = _$controller_;
      $httpBackend.whenGET('/Resources/wallet-options.json').respond();
      
      scope = $rootScope.$new();
      
      Ethereum = $injector.get('Ethereum')
      Ethereum.eth.fromMew = (file) => file

      $controller('EthMewSweepController', {
        $scope: scope
      });
    });
  });

  describe('.submit()', () => {

    it('should not submit if file is invalid', () => {
      scope.fileError = 'Invalid'
      expect(scope.submit()).toBe(false)
    });
    
    it('should submit if file is valid', () => {
      spyOn(Ethereum.eth, 'fromMew')
      scope.keystore = '{"version":3,"id":"cb22a4b1-31cc-4c67-9982-588102d7b5d8","address":"5d6987a4992f02d014abc98603c19337fb88390c","crypto":{"ciphertext":"3d8131e34f5a613ed00ef4e4b8ebc4e46ddc04b45b31af97141e7cbd74ff7b1c","cipherparams":{"iv":"9b48c1d947065c4e755512294bef381b"},"cipher":"aes-128-ctr","kdf":"scrypt","kdfparams":{"dklen":32,"salt":"581e0240a516b7df92d6bf171fbe43a9a5849a29126743b9cf0c65f2d35afd66","n":8192,"r":8,"p":1},"mac":"dd9dc3cfc79d462a36a096e6d46960f47aa7c491cfd3f940678fb76d7a6aec0e"}}';
      scope.submit()
      expect(Ethereum.eth.fromMew).toHaveBeenCalled()
    })
  });
});
