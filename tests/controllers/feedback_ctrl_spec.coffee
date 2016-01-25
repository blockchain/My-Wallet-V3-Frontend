describe "FeedbackCtrl", ->
  scope = undefined
  $httpBackend = undefined;
  $http = undefined;
  expectedFormData = undefined;

  beforeEach angular.mock.module("walletApp")

  beforeEach ->

    angular.mock.inject ($injector, $rootScope, $controller, $http) ->
      Wallet = $injector.get("Wallet")
      MyWallet = $injector.get("MyWallet")
      $http = $injector.get("$http")
      Alerts = $injector.get("Alerts")

      $httpBackend = $injector.get("$httpBackend")

      scope = $rootScope.$new()

      scope.rating = 'AWESOME'
      scope.descriptionGood = 'i like it'
      scope.descriptionBad = 'i dont like it'
      scope.email = 'alice@blockchain.com'
      scope.fullname = 'Alice Bob'

      $controller "FeedbackCtrl",
        $scope: scope

      return

    return

  it "should default to a 'MEH' rating", ->
    expect(scope.rating).toBe('MEH')

  beforeEach ->
    expectedFormData =
      'rating': scope.rating
      'description-good': scope.descriptionGood
      'description-bad': scope.descriptionBad
      'email': scope.email
      'fullname': scope.fullname


  it "should submit a feedback form", ->
    $httpBackend.expectPOST('/feedback', expectedFormData).respond(201, {success: true})
    scope.setFormSubmitted()
    $httpBackend.flush()
    expect(scope.formStage > 0).toBeTruthy()

  it "should show call fail() if submit fails with server 500", ->
    spyOn(scope, "failed")

    $httpBackend.expectPOST('/feedback', expectedFormData).respond(500, {success: false})
    scope.setFormSubmitted()
    $httpBackend.flush()
    expect(scope.formStage).toBe(0)

    expect(scope.failed).toHaveBeenCalled()

  it "should show call fail() if submit fails with server 200", ->
    spyOn(scope, "failed")

    $httpBackend.expectPOST('/feedback', expectedFormData).respond(200, {success: false})
    scope.setFormSubmitted()
    $httpBackend.flush()
    expect(scope.formStage).toBe(0)

    expect(scope.failed).toHaveBeenCalled()


  it "should prevent double clicking on submit", inject(($http) ->
    spyOn($http, "post").and.callFake(() -> {
      success: () -> {
        error: () ->
      }
    })
    scope.setFormSubmitted()
    expect($http.post).toHaveBeenCalled()
    expect(scope.formStage).toBe(1)
  )

  describe "failed()", ->
    it "should show an error", inject((Alerts) ->
      spyOn(Alerts, "displayError")
      scope.failed()
      expect(Alerts.displayError).toHaveBeenCalledWith("FEEDBACK_SUBMIT_FAILED")
  )
