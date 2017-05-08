describe('DynamicFeeController', () => {
  let $rootScope;
  let $controller;

  let newControllerScope = function (feeValues, modalInstance) {
    let scope = $rootScope.$new();
    $controller('DynamicFeeController', {
      $scope: scope,
      $uibModalInstance: modalInstance,
      feeValues
    }
    );
    return scope;
  };

  beforeEach(angular.mock.module('walletApp'));
  beforeEach(() =>
    angular.mock.inject(function (_$rootScope_, _$controller_) {
      $rootScope = _$rootScope_;
      return $controller = _$controller_;
    })
  );

  it('should show the correct text during a surge', () => {
    let scope = newControllerScope({ surge: true });
    expect(scope.btnTranslation).toEqual("CONTINUE_WITH");
  });

  it('should show the correct text when the balance is too high for the fee', () => {
    let scope = newControllerScope({ suggestedFee: 100, maxFee: 99 });
    expect(scope.btnTranslation).toEqual("USE_VALUES");
  });

  it('should show the correct text when current fee is low', () => {
    let scope = newControllerScope({ suggestedFee: 100, currentFee: 99 });
    expect(scope.btnTranslation).toEqual("RAISE_TO");
  });

  it('should show the correct text when current fee is high', () => {
    let scope = newControllerScope({ suggestedFee: 100, currentFee: 101 });
    expect(scope.btnTranslation).toEqual("LOWER_TO");
  });

  describe('modal exit', () => {
    let scope;
    let modalInstance;

    beforeEach(function () {
      let feeValues = { suggestedFee: 123 };
      modalInstance = { close: jasmine.createSpy(), dismiss: jasmine.createSpy() };
      return scope = newControllerScope(feeValues, modalInstance);
    });

    it('should cancel', () => {
      scope.cancel();
      expect(modalInstance.dismiss).toHaveBeenCalledWith('cancelled');
    });

    it('should keep the current fee by exiting with null', () => {
      scope.useCurrent();
      expect(modalInstance.close).toHaveBeenCalledWith(null);
    });

    it('should suggest a fee', () => {
      scope.useSuggested();
      expect(modalInstance.close).toHaveBeenCalledWith(scope.suggestedFee);
    });
  });
});
