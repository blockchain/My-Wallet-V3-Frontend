describe "ModalNotificationCtrl", ->
  scope = undefined

  modalInstance =
    close: ->
    dismiss: ->

  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller) ->

      scope = $rootScope.$new()

      $controller "ModalNotificationCtrl",
        $scope: scope,
        $modalInstance: modalInstance
        notification: {
          type: ''
          icon: ''
          heading: "Title"
          msg: "Message"
        }

      scope.$digest()

      return

    return

  it "should display the notification", ->
    expect(scope.notification.msg).toEqual("Message")
    return

  it "should be dismissed", ->
    spyOn(modalInstance, "close")
    scope.ok()
    expect(modalInstance.close).toHaveBeenCalled()
