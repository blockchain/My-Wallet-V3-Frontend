describe('fees service', function () {
  let fees;
  let $uibModal;

  beforeEach(angular.mock.module('walletApp'));

  beforeEach(() =>
    angular.mock.inject(function ($injector, _$rootScope_) {
      fees = $injector.get('fees');
      $uibModal = $injector.get('$uibModal');
    })
  );

  describe('showLargeTxWarning', function () {
    let mockScope
    beforeEach(() => {
      mockScope = {}
      spyOn($uibModal, 'open').and.callFake(config => {
        config.controller(mockScope)
        return { result: Promise.resolve() }
      })
    });

    it('should get called with the correct modal options', function () {
      fees.showLargeTxWarning(226, 10000);
      let argsObj = jasmine.objectContaining({
        templateUrl: 'partials/large-tx.pug',
        windowClass: 'bc-modal medium',
        controller: jasmine.any(Function)
      });
      expect($uibModal.open).toHaveBeenCalledWith(argsObj);
    });

    it('should assign the correct controller values', function () {
      fees.showLargeTxWarning(256, 10000);
      expect(mockScope.multiplier).toEqual('0.5')
      expect(mockScope.recommendedFee).toEqual(10000)
    });
  });
});
