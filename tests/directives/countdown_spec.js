describe('Countdown Directive', () => {
  let element;
  let isoScope;
  let $interval;

  beforeEach(module('walletApp'));

  beforeEach(inject(function ($compile, $rootScope, $injector, _$q_) {
    let $q = _$q_;
    
    let scope = $rootScope.$new();
    $interval = $injector.get('$interval');
    scope.timeToExpiration = () => 0;
    scope.expire = () => $q.resolve();

    let html = "<countdown time-to-expiration='timeToExpiration' on-expiration='expire()'></countdown>";
    element = $compile(html)(scope);
    scope.$digest();
    return isoScope = element.isolateScope();
  })
  );

  describe('counter()', () => {
    it('should set a count', () => {
      $interval.flush(1000);
      expect(isoScope.count).toBe('0:00');
    });
    
    it('should call onExpiration', () => {
      isoScope.timeToExpiration = () => 0;
      return $interval.flush(1000);
    });
  });
  
  describe("expireCounter", () =>
    it('should set timeToExpiration to 3 seconds', () => {
      isoScope.expireCounter();
      $interval.flush(1000);
      expect(isoScope.count).toBe('0:03');
    })
  );
});
      
