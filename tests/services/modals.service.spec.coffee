describe "modals", () ->
  modals = undefined
  $uibModal = undefined

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, _$rootScope_, _$q_) ->
      modals = $injector.get("modals")
      $uibModal = $injector.get("$uibModal")

  modalOpener = () ->
    $uibModal.open(templateUrl: "<div>modal</div>")

  describe "openOnce", ->
    it "should prevent a second modal from opening", ->
      spyOn($uibModal, "open").and.callThrough()
      open = modals.openOnce(modalOpener)
      open()
      expect($uibModal.open).toHaveBeenCalledTimes(1)
      open()
      expect($uibModal.open).toHaveBeenCalledTimes(1)

  describe "dismissPrevious", ->
    it "should dismiss the first modal when opening a second one", ->
      instanceMock = dismiss: jasmine.createSpy()
      spyOn($uibModal, "open").and.returnValue(instanceMock)
      open = modals.dismissPrevious(modalOpener)
      open()
      expect(instanceMock.dismiss).not.toHaveBeenCalled()
      expect($uibModal.open).toHaveBeenCalledTimes(1)
      open()
      expect(instanceMock.dismiss).toHaveBeenCalledTimes(1)
      expect($uibModal.open).toHaveBeenCalledTimes(2)
