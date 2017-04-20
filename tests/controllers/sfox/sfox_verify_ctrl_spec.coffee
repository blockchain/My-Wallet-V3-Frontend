describe "SfoxVerifyController", ->
  scope = undefined
  Wallet = undefined
  Options = undefined
  $rootScope = undefined
  $controller = undefined
  $q = undefined

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, _$rootScope_, _$controller_, _$q_, _$timeout_) ->
      $rootScope = _$rootScope_
      $controller = _$controller_
      $q = _$q_

      Wallet = $injector.get("Wallet")
      Upload = $injector.get("Upload")
      Options = $injector.get("Options")
      
      Options =
        options:
          partners:
            sfox:
              states: ['NY', 'PA', 'CA']
      
      $httpBackend = $injector.get("$httpBackend")
      $httpBackend.expectGET('/Resources/wallet-options.json').respond({partners: {sfox: {plaid: "1"}}})

      $rootScope.installLock = () ->
        scope.locked = false;
        scope.lock = () -> scope.locked = true;
        scope.free = () -> scope.locked = false;

  getControllerScope = (params = {}) ->
    scope = $rootScope.$new()
    scope.vm =
      goTo: () ->
      exchange:
        profile:
          setSSN: () ->
          setAddress: () ->
          verify: () -> $q.resolve.then(scope.setState)
          getSignedURL: () -> $q.resolve('www.signedurl.com').then().finally(scope.free())
          firstName: 'phil'
          middleName: 'n'
          lastName: 'london'
          dateOfBirth: '05/14/1991'
          identity:
            number: 1
          address:
            street:
              line1: '140'
              line2: '2C'
            city: 'NYC'
            state: 'New York'
            zipcode: '10023'
          verificationStatus:
            level: 'unverified'
            required_docs: ['ssn', 'id', 'address']

    $controller "SfoxVerifyController",
      $scope: scope
      Options: Options
    scope

  beforeEach ->
    scope = getControllerScope()
    $rootScope.$digest()

  describe "setState", ->

    it "should set verificationStatus", ->
      scope.setState()
      expect(scope.state.verificationStatus).toBeDefined()

    it "should set idType to the first idTypes", ->
      idTypes = ['ssn', 'id', 'address']
      scope.setState()
      expect(scope.state.idType).toBe('ssn')

  beforeEach ->
    scope.state =
      file:
        name: 'test-passport.jpg'
      signedURL: 'sfox.com/signed'

  describe "isBeforeNow", ->
    beforeEach ->
      mockNow = new Date("11/24/2016").getTime()
      spyOn(Date, "now").and.returnValue(mockNow)

    it "should return true if date is in past", ->
      past = "11/23/2016"
      expect(scope.isBeforeNow(past)).toEqual(true)

    it "should return false if date is in future", ->
      future = "11/25/2016"
      expect(scope.isBeforeNow(future)).toEqual(false)

  describe "prepUpload", ->

    it "should get a signed url", ->
      spyOn(scope.vm.exchange.profile, 'getSignedURL')
      scope.prepUpload()
      expect(scope.vm.exchange.profile.getSignedURL).toHaveBeenCalled()

  describe "verify", ->
    beforeEach ->
      scope.state.state =
        'Code': 'NY'

    it "should verify a users identity", ->
      spyOn(scope, 'setState')
      spyOn(scope.vm.exchange.profile, 'verify')
      scope.verify()
      scope.$digest()
      expect(scope.vm.exchange.profile.verify).toHaveBeenCalled()
      expect(scope.setState).toHaveBeenCalled()

    it "should call free if verification fails", ->
      spyOn(scope, 'free')
      scope.vm.exchange.profile = null
      scope.verify()
      expect(scope.free).toHaveBeenCalled()
