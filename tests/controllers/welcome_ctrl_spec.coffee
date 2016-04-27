describe "WelcomeCtrl", ->
  scope = undefined

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller) ->
      scope = $rootScope.$new()

      $controller "WelcomeCtrl",
        $scope: scope

      return

    return
