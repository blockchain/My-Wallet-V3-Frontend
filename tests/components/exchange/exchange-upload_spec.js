describe('exchange-upload.component', () => {
  let $rootScope;
  let $compile;
  let $templateCache;
  let $componentController;
  let scope;
  let Wallet;
  let $q;

  let handlers = {
    handleUpload: (file) => $q.resolve().then(() => { scope.$ctrl.file = undefined; })
  };

  let getControllerScope = function (bindings) {
    scope = $rootScope.$new(true);
    $componentController('exchangeUpload', {$scope: scope}, bindings);
    let template = $templateCache.get('templates/exchange/upload.pug');
    $compile(template)(scope);
    return scope;
  };

  beforeEach(module('walletApp'));
  beforeEach(() =>
    angular.mock.inject(function ($injector, _$rootScope_, _$compile_, _$templateCache_, _$componentController_, $httpBackend) {
      // TODO: use Wallet mock, so we don't need to mock this $httpBackend call
      $httpBackend.whenGET('/Resources/wallet-options.json').respond();

      $rootScope = _$rootScope_;
      $compile = _$compile_;
      $templateCache = _$templateCache_;
      $componentController = _$componentController_;

      $q = $injector.get('$q');
      Wallet = $injector.get('Wallet');
      let MyWallet = $injector.get('MyWallet');

      MyWallet.wallet = {};
      Wallet.accounts = () => [];
      Wallet.getDefaultAccount = () => ({});

      MyWallet.wallet.external = {
        sfox: {
          profile: {}
        }
      };
    }));

  describe('.onUpload()', () => {
    beforeEach(function () {
      scope = getControllerScope(handlers);
    });

    it('should call handleUpload', () => {
      scope.$ctrl.onUpload();
      expect(scope.$ctrl.file).toBe(undefined);
    });
  });
});
