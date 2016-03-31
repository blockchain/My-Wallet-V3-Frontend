describe "DynamicFeeController", ->
  $rootScope = undefined
  $controller = undefined

  newControllerScope = (feeValues, modalInstance) ->
    scope = $rootScope.$new()
    $controller "DynamicFeeController",
      $scope: scope
      $uibModalInstance: modalInstance
      feeValues: feeValues
    return scope

  beforeEach angular.mock.module("walletApp")
  beforeEach ->
    angular.mock.inject (_$rootScope_, _$controller_) ->
      $rootScope = _$rootScope_
      $controller = _$controller_

  it "should show the correct text during a surge", ->
    scope = newControllerScope({ surge: true })
    expect(scope.btnTranslation).toEqual("CONTINUE_WITH")

  it "should show the correct text when the balance is too high for the fee", ->
    scope = newControllerScope({ suggestedFee: 100, maxFee: 99 })
    expect(scope.btnTranslation).toEqual("USE_VALUES")

  it "should show the correct text when current fee is low", ->
    scope = newControllerScope({ suggestedFee: 100, currentFee: 99 })
    expect(scope.btnTranslation).toEqual("RAISE_TO")

  it "should show the correct text when current fee is high", ->
    scope = newControllerScope({ suggestedFee: 100, currentFee: 101 })
    expect(scope.btnTranslation).toEqual("LOWER_TO")

  describe "modal exit", ->
    scope = undefined
    modalInstance = undefined

    beforeEach ->
      feeValues = { suggestedFee: 123 }
      modalInstance = { close: jasmine.createSpy(), dismiss: jasmine.createSpy() }
      scope = newControllerScope(feeValues, modalInstance)

    it "should cancel", ->
      scope.cancel()
      expect(modalInstance.dismiss).toHaveBeenCalledWith("cancelled")

    it "should keep the current fee by exiting with null", ->
      scope.useCurrent()
      expect(modalInstance.close).toHaveBeenCalledWith(null)

    it "should suggest a fee", ->
      scope.useSuggested()
      expect(modalInstance.close).toHaveBeenCalledWith(scope.suggestedFee)
