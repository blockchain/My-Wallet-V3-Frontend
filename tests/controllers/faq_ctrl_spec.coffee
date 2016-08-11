describe "faqCtrl", ->
  Wallet = undefined
  scope = undefined
  
  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller) ->
      scope = $rootScope.$new()

      $controller "faqCtrl",
        $scope: scope

      return

    return

  describe "toggleCurr", ->
    it "should change the boolean value of displayed to true if it is false", ->
      scope.items = [{ displayed: false }, { displayed: true }]
      id = 1
      
      scope.toggleCurr(id)
      expect(scope.items[1].displayed).toBe(false)