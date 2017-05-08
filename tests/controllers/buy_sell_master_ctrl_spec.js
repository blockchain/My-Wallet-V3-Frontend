describe('BuySellMasterController', () => {
  let $rootScope;
  let $controller;
  let $state;
  let MyWallet;
  let cta;

  beforeEach(angular.mock.module('walletApp'));

  beforeEach(function () {
    let external = {
      coinify: {},
      sfox: {}
    };

    return angular.mock.inject(function ($injector, _$rootScope_, _$controller_, _$state_) {
      $rootScope = _$rootScope_;
      $controller = _$controller_;
      $state = _$state_;

      MyWallet = $injector.get('MyWallet');

      cta =
        {setBuyCtaDismissed() {}};

      return MyWallet.wallet =
        {external};
    });
  });

  let getController = function (profile, accounts, quote) {
    let $scope = $rootScope.$new();

    return $controller("BuySellMasterController", {
      cta,
      $scope,
      $uibModalInstance: { close: (function () {})({dismiss() {}}) },
      exchange: { profile }
    });
  };

  it('should set buy cta dismissed', () => {
    spyOn(cta, 'setBuyCtaDismissed');
    let ctrl = getController();
    expect(cta.setBuyCtaDismissed).toHaveBeenCalled();
  });

  describe('.resolveState()', () => {

    it('should resolve to .select if user has no exchange account', () => {
      let ctrl = getController();
      expect(ctrl.resolveState()).toBe('.select');
    });

    it('should resolve to .coinify if user has a coinify account', () => {
      MyWallet.wallet.external.coinify.user = 1;
      let ctrl = getController();
      expect(ctrl.resolveState()).toBe('.coinify');
    });

    it('should resolve to .sfox if user has a sfox account', () => {
      MyWallet.wallet.external.sfox.user = 1;
      let ctrl = getController();
      expect(ctrl.resolveState()).toBe('.sfox');
    });
  });
});
