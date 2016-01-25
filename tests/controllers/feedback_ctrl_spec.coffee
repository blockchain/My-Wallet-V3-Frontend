describe "FeedbackCtrl", ->
  scope = undefined
  $httpBackend = undefined;

  beforeEach angular.mock.module("walletApp")

  beforeEach ->

    angular.mock.inject ($injector, $rootScope, $controller, $http) ->
      Wallet = $injector.get("Wallet")
      MyWallet = $injector.get("MyWallet")

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

  it "should submit a feedback form", ->
    form =
      'rating': scope.rating
      'description-good': scope.descriptionGood
      'description-bad': scope.descriptionBad 
      'email': scope.email
      'fullname': scope.fullname

    $httpBackend.expectPOST('/feedback', form).respond(201, '')
    scope.setFormSubmitted()
    $httpBackend.flush()
    expect(scope.formStage > 0).toBeTruthy()

