describe('UnocoinBankTransferController', () => {
  let $q;
  let $rootScope;
  let $controller;
  let $compile;
  let $templateCache;
  let Alerts;
  let scope;
  let unocoin;

  let formatTrade = {
    initiated (trade) { return $q.resolve({ id: 2 }); }
  };

  beforeEach(angular.mock.module('walletApp'));

  beforeEach(() => {
    module(($provide) => {
      $provide.factory('Env', ($q) => $q.resolve({
        partners: {
          unocoin: {
            surveyTradeLinks: {}
          }
        }
      }));
    });
  });

  beforeEach(() =>
    angular.mock.inject(function ($injector, _$q_, _$rootScope_, _$controller_, _$compile_, _$templateCache_, $httpBackend) {
      $httpBackend.whenGET('/Resources/wallet-options.json').respond();

      $q = _$q_;
      $rootScope = _$rootScope_;
      $controller = _$controller_;
      $compile = _$compile_;
      $templateCache = _$templateCache_;
      Alerts = $injector.get('Alerts');
      unocoin = $injector.get('unocoin');
    })
  );

  let getController = function (scope) {
    return $controller("UnocoinBankTransferController", {
      $scope: scope,
      $uibModalInstance: { close: (function () {})({dismiss () {}}) },
      trade: {
        addReferenceNumber: (ref) => { return $q.resolve({}).then(() => {}).then(() => {}); }
      },
      bankAccount: {},
      formatTrade: {
        bankTransfer:
          (trade, bankAccount) => { return 'trade'; },
        initiated:
          (trade) => { return true; }
      },
      step: ''
    });
  };

  let getControllerScope = () => {
    scope = $rootScope.$new();

    let template = $templateCache.get('partials/unocoin/bank-transfer.pug');
    let controller = getController({}, {}, {}, scope);

    $compile(template)(scope);
    return scope;
  };

  describe('onStep()', () => {
    it('should have onOrAfterStep correct', () => {
      let ctrl = getController();
      expect(ctrl.onStep('reference')).toBe(false);
    });
  });

  describe('addReferenceNumber()', () => {
    let ctrl;

    beforeEach(() => {
      scope = getControllerScope();
      ctrl = getController();
    });

    it('should call lock()', () => {
      spyOn(ctrl, 'lock');
      ctrl.addReferenceNumber();
      expect(ctrl.lock).toHaveBeenCalled();
    });

    it('should set formattedTrade', () => {
      ctrl.addReferenceNumber();
      expect(ctrl.formattedTrade).toBe('trade');
    });

    it('should goTo initiated', () => {
      spyOn(ctrl, 'goTo');
      ctrl.addReferenceNumber();
      scope.$digest();
      expect(ctrl.goTo).toHaveBeenCalledWith('initiated');
    });
  });
});
