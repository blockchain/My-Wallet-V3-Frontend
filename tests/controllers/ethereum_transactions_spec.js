describe('ethereumTransactionsCtrl', () => {
  let scope;

  beforeEach(angular.mock.module('walletApp'));

  beforeEach(function () {
    angular.mock.inject(function ($injector, $rootScope, $controller, $q, $httpBackend) {
      // TODO: use Wallet mock, so we don't need to mock this $httpBackend call
      $httpBackend.whenGET('/Resources/wallet-options.json').respond();

      let Wallet = $injector.get('Wallet');
      let MyWallet = $injector.get('MyWallet');
      let smartAccount = $injector.get('smartAccount');
      let Ethereum = $injector.get('Ethereum')

      MyWallet.wallet = {
        hdwallet: {
          accounts: [
            { label: "Checking", index: 0, archived: false, balance: 100 },
            { label: "Savings", index: 1, archived: false, balance: 175 },
            { label: "Spending", index: 2, archived: false, balance: 0 },
            { label: "Partay", index: 3, archived: true, balance: 50 }
          ],
          defaultAccount: { label: "Checking", index: 0, archived: false, balance: 100 },
          defaultAccountIndex: 0
        },
        txList: {
          subscribe () { return (function () { }); },
          transactions () {
            return [{ result: 1, txType: 'received', processedInputs: [{'address': '123'}], processedOutputs: [{'address': '456'}]}];
          }
        },
        fetchTransactions () {
          return $q.resolve(1);
        }
      };

      Wallet.status = {
        isLoggedIn: true,
        didLoadBalances: true
      };

      Wallet.legacyAddresses = () => ['1A2B3C'];
      Wallet.accounts = () => MyWallet.wallet.hdwallet.accounts;
      MyWallet.accountInfo = {
        countryCodeGuess: 'UK'
      }

      scope = $rootScope.$new();

      scope.root = {
        size: {
          xs: true,
          lg: false
        }
      };

      $controller('ethereumTransactionsCtrl',
        {$scope: scope});

      scope.selectedAcountIndex = 1;

    });

  });

  describe('the transctions controller', () => {

    describe('filterSearch', () => {

      it('should filter', () => {
        spyOn(scope, 'filterSearch');
        scope.filterSearch(1, "test");
        expect(scope.filterSearch).toHaveBeenCalled();
      });

      it('should return if no search param', () => {
        expect(scope.filterSearch(1)).toBe(true)
      })
    })

    describe('filterByType', () => {

      it('should show all', () => {
        let tx = {};
        tx.txType = 'sent';
        scope.filterBy.type = 'ALL_TRANSACTIONS';

        let result = scope.filterByType(tx);
        expect(result).toBe(true);
      });

      it('should filter by sent', () => {
        let tx = {};
        tx.getTxType = () => 'sent'
        scope.filterBy.type = 'SENT';

        let result = scope.filterByType(tx);
        expect(result).toBe(true);
      });

      it('should filter by received', () => {
        let tx = {};
        tx.getTxType = () => 'received'
        scope.filterBy.type = 'RECEIVED';

        let result = scope.filterByType(tx);
        expect(result).toBe(true);
      });
    });
  });
});
