describe('coinify-create-account.component', () => {
  let $q;
  let scope;
  let Wallet;
  let $rootScope;
  let buySell;
  $rootScope = undefined;
  let $compile;
  let $templateCache;
  let $componentController;

  let handlers = {
    viewInfo: false,
    onSubmit,
    onSuccess,
    country: 'DK',
  };

  var onSuccess = () => $q.resolve();
  var onSubmit = () => $q.resolve();

  let getController = function (bindings) {
    scope = $rootScope.$new();
    let ctrl = $componentController("coinifyCreateAccount", {$scope: scope}, bindings);
    let template = $templateCache.get('partials/coinify/coinify-create-account.pug');
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

      Wallet = $injector.get('Wallet');
      return buySell = $injector.get('buySell');
    })
  );

  describe('showDanish', () => {
    beforeEach(function () {
      let ctrl;
      return ctrl = undefined;
    });

    it('should show Danish inputs if country and currency are DK and DKK', () => {
      let ctrl = getController(handlers);
      expect(ctrl.showDanish).toEqual(true);
    });
  });

  describe('.formatIban()', () => {
    beforeEach(function () {
      let ctrl;
      return ctrl = undefined;
    });

    it('should format the iban', () => {
      let ctrl = getController(handlers);
      ctrl.bank.account.number = 'ABCD EFGH 1234 56';
      ctrl.formatIban();
      expect(ctrl.bank.account.number).toEqual('ABCD EFGH 1234 56');
    });
  });

  describe('.turnOffIbanError()', () => {
    beforeEach(function () {
      let ctrl;
      return ctrl = undefined;
    });

    it('should set ibanError to false', () => {
      let ctrl = getController(handlers);
      ctrl.turnOffIbanError();
      expect(ctrl.ibanError).toBe(false);
    });
  });

  describe('.switchView()', () => {
    beforeEach(function () {
      let ctrl;
      return ctrl = undefined;
    });

    it('should switch viewInfo', () => {
      let ctrl = getController(handlers);
      ctrl.viewInfo = true;
      ctrl.switchView();
      expect(ctrl.viewInfo).toBe(false);
    });
  });
});
