describe('CoinifyTradeSummaryController', () => {
  let $q;
  let scope;
  let $rootScope;
  let $controller;
  let formatTrade;
  
  var trade = {
    id: 1,
    state: 'completed',
    inCurrency: 'USD',
    outCurrency: 'BTC',
    refresh() { return $q.resolve(trade); },
    watchAddress() { return $q.resolve(); },
    fakeBankTransfer() { return $q.resolve(); }
  };

  beforeEach(angular.mock.module('walletApp'));

  beforeEach(() =>
    angular.mock.inject(function ($injector, _$rootScope_, _$controller_, _$q_, _$timeout_) {
      $rootScope = _$rootScope_;
      $controller = _$controller_;
      $q = _$q_;
      
      return formatTrade = $injector.get('formatTrade');
    })
  );

  let getControllerScope = function (params) {
    if (params == null) { params = {}; }
    scope = $rootScope.$new();
    scope.vm = {
      trade,
      buySellDebug: true
    };

    $controller("CoinifyTradeSummaryController",
      {$scope: scope});
    return scope;
  };

  beforeEach(function () {
    scope = getControllerScope();
    return $rootScope.$digest();
  });

  describe('.fakeBankTransfer()', function () {

    it('should fake a bank transfer', () => {
      spyOn(scope.vm.trade, 'fakeBankTransfer');
      scope.fakeBankTransfer();
      return expect(scope.vm.trade.fakeBankTransfer).toHaveBeenCalled();
    });
      
    it('should format a trade', () => {
      spyOn(formatTrade, 'processing');
      scope.fakeBankTransfer();
      scope.$digest();
      return expect(formatTrade.processing).toHaveBeenCalledWith(trade);
    });
  });
});
