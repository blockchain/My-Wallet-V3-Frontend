describe('OptionsServices', () => {
  let $httpBackend;
  let Options;

  beforeEach(angular.mock.module('walletApp'));

  beforeEach(function () {
    angular.mock.inject(function ($injector, _$rootScope_) {

      $httpBackend = $injector.get('$httpBackend');

      Options = $injector.get('Options');
      let rootScope = _$rootScope_;

    });

  });

  describe('get()', () => {
    let response;

    beforeEach(() =>
      $httpBackend.expectGET('/Resources/wallet-options.json').respond(JSON.stringify({
        showBuySellTab: ["US"],
        partners: {
          coinify: {
            countries: ["US"]
          }
        }
      })
      )
    );


    it('should download a list of options', () => {
      Options.get().then(data => response = data);

      $httpBackend.flush();

      expect(response.showBuySellTab).toEqual(['US']);
    });

    it('should cache the result', () => {
      Options.get().then(data => response = data);

      $httpBackend.flush();

      Options.get().then(data => response = data);

      expect(() => $httpBackend.flush()).toThrow();
    });
  });

  return afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    return $httpBackend.verifyNoOutstandingRequest();
  });
});
