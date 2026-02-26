describe('send-confirm.component', () => {
  let $q;
  let $rootScope;
  $rootScope = undefined;
  let $compile;
  let $templateCache;
  let $componentController;
  let Wallet;
  let scope;

  let tx = {
    fee: 1,
    amount: 10,
    destination: {
      type: 'External'
    }
  };

  let handlers = {
    tx,
    asset: 'btc'
  };

  let getController = function (bindings) {
    scope = $rootScope.$new();
    let ctrl = $componentController('sendConfirm', {$scope: scope}, bindings);
    let template = $templateCache.get('partials/send/send-confirm.pug');
    $compile(template)(scope);
    return ctrl;
  };

  beforeEach(module('walletApp'));

  beforeEach(() =>
    angular.mock.inject(function ($injector, _$rootScope_, _$compile_, _$templateCache_, _$componentController_) {
      $rootScope = _$rootScope_;
      $compile = _$compile_;
      $templateCache = _$templateCache_;
      $componentController = _$componentController_;
      $q = $injector.get('$q');
      Wallet = $injector.get('Wallet');

      let askForSecondPassword = $q.defer();
      Wallet.askForSecondPasswordIfNeeded = () => askForSecondPassword.promise;

      Wallet.my.wallet = {
        hdwallet: {
          defaultAccount: {index: 0}
        },
        createPayment: () => ({
          from: () => {},
          amount: () => {},
          updateFeePerKb: () => {},
          sideEffect: () => {}
        })
      };
    })
  );

  describe('.getTransactionTotal()', () => {
    let ctrl;
    beforeEach(() => ctrl = getController(handlers));

    it('should return the total', () => {
      expect(ctrl.getTransactionTotal(true)).toEqual(11);
    });
  });

  describe('.getButtonContent()', () => {
    it('should return the correct copy', () => {
      let ctrl = getController(handlers);
      expect(ctrl.getButtonContent()).toEqual('SEND_BITCOIN');
      ctrl.asset = 'eth';
      expect(ctrl.getButtonContent()).toEqual('SEND_ETHER');
      ctrl.asset = 'bch';
      expect(ctrl.getButtonContent()).toEqual('SEND_BITCOIN_CASH');
    });
  });
});
