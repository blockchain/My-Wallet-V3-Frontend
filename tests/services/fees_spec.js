
describe('fees service', function () {
  let fees;
  let $uibModal;

  beforeEach(angular.mock.module('walletApp'));

  beforeEach(() =>
    angular.mock.inject(function ($injector, _$rootScope_) {
      fees = $injector.get('fees');
      return $uibModal = $injector.get('$uibModal');
    })
  );

  describe('showFeeWarning', function () {

    beforeEach(() => spyOn($uibModal, 'open').and.callFake(() => ({ result: null })));

    it('should get called with the correct modal options', function () {
      fees.showFeeWarning();
      let argsObj = jasmine.objectContaining({
        templateUrl: 'partials/dynamic-fee.pug',
        windowClass: 'bc-modal medium',
        controller: 'DynamicFeeController'
      });
      expect($uibModal.open).toHaveBeenCalledWith(argsObj);
    });
  });
});
