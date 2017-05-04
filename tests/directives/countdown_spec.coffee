describe "Countdown Directive", ->
  element = undefined
  isoScope = undefined
  $interval = undefined

  beforeEach module("walletApp")

  beforeEach inject(($compile, $rootScope, $injector, _$q_) ->
    $q = _$q_
    
    scope = $rootScope.$new()
    $interval = $injector.get('$interval')
    scope.timeToExpiration = () -> 0
    scope.expire = () -> $q.resolve()

    html = "<countdown time-to-expiration='timeToExpiration' on-expiration='expire()'></countdown>"
    element = $compile(html)(scope)
    scope.$digest()
    isoScope = element.isolateScope()
  )

  describe "counter()", ->
    it "should set a count", ->
      $interval.flush(1000)
      expect(isoScope.count).toBe('0:00')
    
    it "should call onExpiration", ->
      isoScope.timeToExpiration = () -> 0
      $interval.flush(1000);
  
  describe "expireCounter", ->
    it "should set timeToExpiration to 3 seconds", ->
      isoScope.expireCounter()
      $interval.flush(1000)
      expect(isoScope.count).toBe('0:03')
      
