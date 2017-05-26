describe('RequestCtrl', () => {

  let scope;
  let modalInstance = {
    close () {},
    dismiss () {}
  };

  beforeEach(angular.mock.module('walletApp'));

  beforeEach(() => {
    angular.mock.inject(($httpBackend) => {
      // TODO: use Wallet mock, so we don't need to mock this $httpBackend call
      $httpBackend.whenGET('/Resources/wallet-options.json').respond();
    });
  });

  beforeEach(function () {
    angular.mock.inject(function ($injector, $controller, $rootScope, $compile, $templateCache) {
      let Wallet = $injector.get('Wallet');
      let MyWallet = $injector.get('MyWallet');
      let currency = $injector.get('currency');
      let smartAccount = $injector.get('smartAccount');

      MyWallet.wallet = {
        isUpgradedToHD: true,
        keys: [
          { address: '1asdf', archived: false, isWatchOnly: false }, { address: '1asdf', archived: true }
        ],
        hdwallet: {
          accounts: [{ index: 0, archived: true },
                     { index: 1, archived: false },
                     { index: 2, archived: true },
                     { label: "Checking", index: 3, archived: false, balance: 100 }],
          defaultAccountIndex: 0,
          defaultAccount: { label: "Checking", index: 3, archived: false, balance: 100 }
        }

      };

      Wallet.settings = {
        currency: currency.currencies[0],
        btcCurrency: currency.bitCurrencies[0]
      };

      Wallet.status = {
        didInitializeHD: true,
        isLoggedIn: true
      };

      currency.conversions.EUR = { conversion: 400000 };

      $rootScope.rootURL = 'https://blockchain.info/';
      scope = $rootScope.$new();
      let template = $templateCache.get('partials/request.pug');

      $controller('RequestCtrl', {
        $scope: scope,
        $rootScope,
        $stateParams: {},
        $uibModalInstance: modalInstance,
        destination: undefined,
        focus: false,
        hasLegacyAddress: true
      }
      );

      scope.model = { state: {to: null, amount: '0', currency: Wallet.settings.currency, label: ""} };
      $compile(template)(scope);

      scope.$digest();

      scope.state.amount = '1';
      scope.$apply();

    });

  });

  describe('destinations', () => {
    it('should include accounts',  function () {
      expect(scope.destinations.length).toBeGreaterThan(0);
      expect(scope.destinations[0].index).toBeDefined();
    });

    it('should not include archived accounts',  inject(function (Wallet) {
      // Make sure there's an archived account in the mocks:
      let match = false;
      for (let account of Array.from(scope.accounts())) {
        if (account.archived) { match = true; }
      }

      expect(match).toBe(true, "Archived account missing in mocks");

      // Test that this archived account is not included in origins:
      return Array.from(scope.destinations).map((destination) =>
        expect(destination.archived).toBe(false, "Archived account in destinations"));
    })
    );
  });

  describe('when requesting for a legacy address', () => {

    it('should select the users currency by default', inject(Wallet=> expect(scope.settings.currency.code).toBe("USD"))
    );

    it('should have a bit currency', inject(Wallet=> expect(scope.settings.btcCurrency).toBeDefined())
    );

    it('should have access to legacy addresses',  inject(function () {
      expect(scope.legacyAddresses).toBeDefined();
      expect(scope.legacyAddresses().length).toBeGreaterThan(0);
    })
    );

    it('should combine accounts and active legacy addresses in destinations', () => {
      expect(scope.destinations).toBeDefined();

      let foundAccount = false;
      let foundLegacyAddress = false;

      for (let destination of Array.from(scope.destinations)) {
        if (destination.index != null) { foundAccount = true; }
        if ((destination.index == null)) { foundLegacyAddress = true; }
      }

      expect(foundAccount).toBe(true);
      expect(foundLegacyAddress).toBe(true);
    });
  });

  describe('paymentRequestURL', () => {

    it('should use the latest currency', () => {
      scope.state.to = scope.legacyAddresses()[0];
      scope.state.amountType = 'amount_local';
      scope.state.baseCurr = scope.settings.currency;
      scope.state.amount = 10000000;

      expect(scope.paymentRequestURL()).toContain("USD");
    });

    it('should show a payment URL when legacy address is selected', () => {
      scope.state.to = scope.legacyAddresses()[0];
      scope.$digest();
      expect(scope.paymentRequestURL()).toBeDefined();
      expect(scope.paymentRequestURL()).toContain("payment_request");
    });


    it('should show a payment URL with amount when legacy address is selected and amount > 0', () => {
      scope.state.to = scope.legacyAddresses()[0];
      scope.state.amountType = 'amount_local';
      scope.state.amount = 10000000;
      scope.$digest();
      expect(scope.paymentRequestURL()).toBeDefined();
      expect(scope.paymentRequestURL()).toContain("amount_local");
    });

    it('should not have amount argument in URL if amount is zero, null or empty', () => {
      scope.state.to = scope.legacyAddresses()[0];
      scope.state.amount = null;
      scope.$digest();
      expect(scope.paymentRequestURL()).toBeDefined();
      expect(scope.paymentRequestURL()).not.toContain("amount_local=");

      scope.state.amount = null;
      scope.$digest();
      expect(scope.paymentRequestURL()).not.toContain("amount_local=");

      scope.state.amount = "";
      scope.$digest();
      expect(scope.paymentRequestURL()).not.toContain("amount_local=");
    });

    it('should generate a valid payment request url', () => {
      scope.state.to = scope.legacyAddresses()[0];
      scope.state.label = "Label Label Label";
      scope.state.amount = null;
      scope.$digest();

      expect(scope.paymentRequestURL()).toContain('/payment_request?address=1asdf&message=Label%20Label%20Label');
    });

    it('should contain amountType', () => {
      scope.state.to = scope.legacyAddresses()[0];
      scope.state.label = "Label Label Label";
      scope.state.amountType = 'amount_local';
      scope.state.amount = 100;
      scope.$digest();

      expect(scope.paymentRequestURL()).toContain('amount_local=');
    });

    it('should generate a bitcoin url with a message param instead of a label', () => {
      scope.state.to = scope.legacyAddresses()[0];
      scope.state.label = "This is a message, though we save it as a label";
      scope.$digest();

      expect(scope.paymentRequestURL()).toContain('message');
      expect(scope.paymentRequestURL()).not.toContain('label=');
    });
  });

  describe('isToImportedAddress', () =>

    it('should be true if destination is imported address', () => {
      scope.state.to = scope.destinations[2];
      expect(scope.isToImportedAddress()).toBe(true);
    })
  );
});
