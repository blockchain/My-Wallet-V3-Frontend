describe('UnocoinBankTransferController', () => {
  let $controller;
  let options;
  let $rootScope;
  let Alerts;
  let $q;
  let unocoin;

  // let trade = {
  //   addReferenceNumber (ref) { return $q.resolve({id: 1}); }
  // };
  let formatTrade = {
    initiated (trade) { return $q.resolve({id: 2}); }
  };

  beforeEach(angular.mock.module('walletApp'));

  beforeEach(() =>
    angular.mock.inject(function ($injector, _$q_, _$rootScope_, _$controller_, $httpBackend) {
      $httpBackend.whenGET('/Resources/wallet-options.json').respond();

      $rootScope = _$rootScope_;
      $controller = _$controller_;
      Alerts = $injector.get('Alerts');
      $q = _$q_;
      unocoin = $injector.get('unocoin');
    }));

  let getController = (profile, accounts, quote) =>
    $controller('UnocoinBankTransferController', {
      $uibModalInstance: { close: (function () {})({dismiss () {}}) },
      exchange: { profile },
      quote: quote || {},
      options: options || {},
      accounts: accounts || [],
      trade: {
        addReferenceNumber: function (ref) { return $q.resolve().then(this.formattedTrade = formatTrade.initiated()).then(() => this.goTo('initiated')); }
      },
      bankAccount: {},
      formatTrade: {
        bankTransfer:
          function (trade, bankAccount) { return true; }
      },
      formattedTrade: {}
    })
  ;

  describe('onStep()', () => {
    it('should have onOrAfterStep correct', () => {
      let ctrl = getController();
      expect(ctrl.onStep('reference')).toBe(false);
    });
  });

  describe('addReferenceNumber()', () => {
    beforeEach(() => {
      let ctrl;
      ctrl = getController();
      trade = {
        addReferenceNumber () { return $q.resolve().then(ctrl.formattedTrade = formatTrade.initiated()).then(() => ctrl.goTo('initiated')); }
      };
    });

    it('should call lock()', () => {
      let ctrl = getController();
      spyOn(trade, 'addReferenceNumber');
      ctrl.addReferenceNumber();
      // $rootScope.$digest();
      // expect(trade.addReferenceNumber).not.toHaveBeenCalled();
      // $rootScope.$digest();
    });
  });
});
