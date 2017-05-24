describe('BuySellSelectPartnerController', () => {
  let $rootScope;
  let $controller;
  let $state;
  let MyWallet;
  let scope;
  let accountInfo;

  beforeEach(angular.mock.module('walletApp'));

  beforeEach(() => {
    module(($provide) => {
      $provide.factory('Env', ($q) => $q.resolve({
        partners: {
          coinify: {
            countries: ['GB']
          },
          sfox: {
            countries: ['US'],
            states: ['AL', 'PA', 'CA', 'GA']
          }
        }
      }));
    });
  });

  beforeEach(function () {
    accountInfo = {
      countryCodeGuess: "US"
    };

    return angular.mock.inject(function ($injector, _$rootScope_, _$controller_, _$state_) {
      $rootScope = _$rootScope_;
      $controller = _$controller_;
      $state = _$state_;

      MyWallet = $injector.get('MyWallet');

      return MyWallet.wallet =
        {accountInfo};
    });
  });

  let getControllerScope = function () {
    let $scope = $rootScope.$new();

    $scope.vm =
      {base: "base"};

    let options = {
      partners: {
        coinify: {
          countries: ["GB"]
        },
        sfox: {
          countries: ["US"],
          states: ["AL", "GA"]
        }
      }
    };

    $controller('BuySellSelectPartnerController', {
      $scope,
      options,
      buyStatus: {
        canBuy () { return Promise.resolve(true); }
      },
      state: {
        stateCodes: [
          {Code: 'AL'},
          {Code: 'NY'},
          {Code: 'GA'}
        ]
      },
      country: {
        countryCodes: [
          {Code: "US"},
          {Code: "GB", Name: "United Kingdom"},
          {Code: "RU"}
        ]
      }
    });

    $scope.$digest();

    return $scope;
  };

  it('should try to guess the country code', () => {
    accountInfo.countryCodeGuess = "GB";
    scope = getControllerScope();
    scope.$digest();
    expect(scope.country.Name).toEqual("United Kingdom");
  });

  it('should continue if the country can\'t be guessed', () => {
    accountInfo.countryCodeGuess = null;
    scope = getControllerScope();
    scope.$digest();
    expect(scope.country).not.toBeDefined();
  });

  describe('.selectPartner()', () => {
    beforeEach(function () {
      scope = getControllerScope();
      return spyOn($state, "go");
    });

    it('should go to coinify signup', () => {
      scope.selectPartner(scope.partners["coinify"], "GB");
      expect($state.go).toHaveBeenCalledWith("base.coinify", {countryCode: "GB"});
    });

    it('should go to sfox signup', () => {
      scope.selectPartner(scope.partners["sfox"], "US");
      expect($state.go).toHaveBeenCalledWith("base.sfox", {countryCode: "US"});
    });
  });

  describe('.onWhitelist()', () => {
    beforeEach(() => scope = getControllerScope());

    it('should know if a country is on the coinify whitelist', () => {
      expect(scope.onWhitelist("GB")).toEqual("coinify");
    });

    it('should know if a country is on the sfox whitelist', () => {
      expect(scope.onWhitelist("US")).toEqual("sfox");
    });

    it('should know if a country is not on any whitelist', () => {
      expect(scope.onWhitelist("CZ")).toEqual(false)
    });
  });

  describe('partner guess', () => {
    it('should guess Coinify in Europe', () => {
      accountInfo.countryCodeGuess = "GB";
      scope = getControllerScope();
      scope.$digest();
      expect(scope.partner).toEqual(jasmine.objectContaining({name: 'Coinify'}));
    });

    it('should guess SFOX in the USA', () => {
      scope = getControllerScope();
      scope.$digest();
      expect(scope.partner).toEqual(jasmine.objectContaining({name: 'SFOX'}));
    });

    it('should not guess SFOX in the USA for excluded states', () => {
      accountInfo.countryCodeGuess = "US";
      scope = getControllerScope();
      scope.state = {Code: 'NY'};
      scope.$digest();
      expect(scope.partner).toEqual(null);
    });

    it('should guess SFOX in the USA for included states', () => {
      accountInfo.countryCodeGuess = "US";
      scope = getControllerScope();
      scope.state = {Code: 'GA'};
      scope.$digest();
      expect(scope.partner).toEqual(jasmine.objectContaining({name: 'SFOX'}));
    });

    it('should guess SFOX when user selects US for US IP address', () => {
      accountInfo.countryCodeGuess = "US";
      scope = getControllerScope();
      scope.$digest();
      scope.country = {Code: "GB"}; // User selects other country
      scope.$digest();
      scope.country = {Code: "US"}; // User selects US again
      scope.$digest();
      expect(scope.partner).toEqual(jasmine.objectContaining({name: 'SFOX'}));
    });

    it('should not guess SFOX when user selects US for non-US IP address', () => { // Temporary measure
      accountInfo.countryCodeGuess = "GB";
      scope = getControllerScope();
      scope.$digest();
      scope.country = {Code: "US"}; // User selects US
      scope.$digest();
      expect(scope.partner).toEqual(null);
    });

    it('should guess nothing for other countries', () => {
      accountInfo.countryCodeGuess = "RU";
      scope = getControllerScope();
      scope.$digest();
      expect(scope.partner).toEqual(null);
    });

    it('should guess Coinify if user switches country to Europe', () => {
      scope = getControllerScope();
      scope.$digest();
      scope.country = {Code: "GB"};
      scope.$digest();
      expect(scope.partner).toEqual(jasmine.objectContaining({name: 'Coinify'}));
    });

    it('should guess nothing if user switches country to other', () => {
      scope = getControllerScope();
      scope.$digest();
      scope.country = {Code: "RU"};
      scope.$digest();
      expect(scope.partner).toEqual(null);
    });
  });
});
