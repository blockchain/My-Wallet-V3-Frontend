describe('SettingsPreferencesCtrl', () => {
  let scope;
  let Wallet;

  let modal =
    {open() {}};

  let mockObserver = {
    success () {},
    error () {}};

  beforeEach(angular.mock.module('walletApp'));

  beforeEach(function () {
    angular.mock.inject(function ($injector, $rootScope, $controller) {
      Wallet = $injector.get('Wallet');
      let MyWallet = $injector.get('MyWallet');

      Wallet.status.isLoggedIn = true;

      Wallet.user = {email: "steve@me.com"};

      Wallet.settings_api =
        {changeEmail(email, success, error) { return success(); }};

      Wallet.settings.languages = [
        {code: "en", name: "English"},
        {code: "fr", name: "French"}
      ];

      Wallet.settings.currencies = [
        {code: "USD", name: "U.S. Dollar"},
        {code: "EUR", name: "Euro"}
      ];

      Wallet.settings_api.changeLanguage = (function () { });
      Wallet.settings_api.changeLocalCurrency = (function () { });

      Wallet.setLanguage(Wallet.settings.languages[0]);
      Wallet.changeCurrency(Wallet.settings.currencies[0]);

      spyOn(Wallet, "setLanguage").and.callThrough();
      spyOn(Wallet, "changeLanguage").and.callThrough();
      spyOn(Wallet, "changeCurrency").and.callThrough();

      scope = $rootScope.$new();

      $controller("SettingsPreferencesCtrl", {
        $scope: scope,
        $stateParams: {},
        $uibModal: modal
      }
      );

      scope.$digest();

    });

  });

  describe('email', () => {
    it("should be set on load", inject(Wallet => expect(scope.user.email).toEqual("steve@me.com"))
    );

    it("should not spontaniously save", inject(function (Wallet) {
      spyOn(Wallet, "changeEmail");
      expect(Wallet.changeEmail).not.toHaveBeenCalled();

    })
    );

  });

  describe('language', () => {
    beforeEach(() => scope.$digest());

    it("should be set on load", inject(function () {
      expect(Wallet.status.isLoggedIn).toBe(true);
      expect(scope.settings.language).toEqual({code: "en", name: "English"});
    })
    );

    it("should not spontaniously save", inject(function (Wallet) {
      scope.$digest();
      expect(Wallet.changeLanguage).not.toHaveBeenCalled();
    })
    );

    it("should switch to another language", inject(function (Wallet) {
      expect(scope.languages.length).toBeGreaterThan(1);
      expect(scope.settings.language).not.toBeNull();
      expect(scope.settings.language).not.toEqual(scope.languages[0]); // English is not the first one in the list

      // Switch language:
      scope.settings.language = scope.languages[0];
      scope.changeLanguage(scope.settings.language);
      expect(Wallet.changeLanguage).toHaveBeenCalledWith(scope.languages[0]);
    })
    );
  });

  describe('currency', () => {
    beforeEach(() => scope.$digest());

    it("should not spontaniously save", inject(function (Wallet) {
      scope.$digest();
      expect(Wallet.changeCurrency).not.toHaveBeenCalled();
    })
    );

    it("can be changed", inject(function (Wallet) {
      expect(scope.currencies.length).toBeGreaterThan(1);
      scope.settings.currency = scope.currencies[0];
      expect(scope.settings.currency).not.toBeNull();

      // Switch language:
      scope.settings.currency = scope.currencies[1];
      scope.changeCurrency(scope.settings.currency);
      expect(Wallet.changeCurrency).toHaveBeenCalledWith(scope.currencies[1]);
    })
    );
  });

  describe("handling of bitcoin links", () =>
    it("can be enabled", inject(function (Wallet) {
      spyOn(Wallet, "handleBitcoinLinks");
      scope.setHandleBitcoinLinks();
      expect(Wallet.handleBitcoinLinks).toHaveBeenCalled();
    })
    )
  );
});

