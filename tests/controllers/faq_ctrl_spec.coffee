describe "faqCtrl", ->
  scope = undefined

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller) ->
      scope = $rootScope.$new()
      $controller "faqCtrl",
        $scope: scope

  it "should have an array of questions", ->
    expect(scope.questions.length).toBeGreaterThan(0)

  it "should set question displayed to false by default", ->
    expect(scope.questions[0].displayed).toEqual(false)

  describe "toggle", ->
    it "should toggle question display to true", ->
      q = scope.questions[0]
      scope.toggle(q)
      expect(q.displayed).toBe(true)

    it "should toggle question display to false", ->
      q = scope.questions[0]
      q.displayed = true
      scope.toggle(q)
      expect(q.displayed).toBe(false)
