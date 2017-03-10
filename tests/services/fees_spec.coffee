
describe 'fees service', () ->
  fees = undefined
  $uibModal = undefined

  beforeEach angular.mock.module('walletApp')

  beforeEach ->
    angular.mock.inject ($injector, _$rootScope_) ->
      fees = $injector.get('fees')
      $uibModal = $injector.get('$uibModal')

  describe 'showFeeWarning', ->

    beforeEach ->
      spyOn($uibModal, 'open').and.callFake -> { result: null }

    it 'should get called with the correct modal options', ->
      fees.showFeeWarning()
      argsObj = jasmine.objectContaining({
        templateUrl: 'partials/dynamic-fee.pug',
        windowClass: 'bc-modal medium',
        controller: 'DynamicFeeController'
      })
      expect($uibModal.open).toHaveBeenCalledWith(argsObj)
