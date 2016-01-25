describe "FirstTimeCtrl", ->
  scope = undefined

  modalInstance =
    close: ->
    dismiss: ->

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller) ->

      scope = $rootScope.$new()

      $controller "FirstTimeCtrl",
        $scope: scope,
        $uibModalInstance: modalInstance
        firstTime: true

      scope.$digest()

      return

    return
    
  it "should be dismissed", ->
    spyOn(modalInstance, "close")
    scope.ok()
    expect(modalInstance.close).toHaveBeenCalled()