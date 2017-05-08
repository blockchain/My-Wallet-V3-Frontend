describe('sell-bank-link.component', () => {
  let $q;
  let scope;
  let Wallet;
  let $rootScope;
  let buySell;
  $rootScope = undefined;
  let $compile;
  let $templateCache;
  let $componentController;

  let accounts = [
    {
      _account : {
        id: 12345,
        type: 'sepa',
        account: {
          number: 123456789,
          bic: '123abc'
        },
        bank: {
          address: {
            country: 'GB'
          }
        },
        holder: {
          name: 'John Smith',
          address: {
            country: 'GB'
          }
        }
      }
    }
  ];

  let selectedBankAccount = 'Bank 1';

  let handlers = {
    accounts,
    selectedBankAccount
  };

  let getController = function (bindings) {
    scope = $rootScope.$new();
    let ctrl = $componentController("sellBankLink", {$scope: scope}, bindings);
    let template = $templateCache.get('partials/coinify/bank-link.pug');
    $compile(template)(scope);
    return ctrl;
  };

  beforeEach(module('walletApp'));
  beforeEach(() =>
    angular.mock.inject(function ($injector, _$rootScope_, _$compile_, _$templateCache_, _$componentController_) {
      $rootScope = _$rootScope_;
      $compile = _$compile_;
      $templateCache = _$templateCache_;
      $componentController = _$componentController_;

      Wallet = $injector.get('Wallet');
      return buySell = $injector.get('buySell');
    })
  );

  describe('.selecting', () => {

    beforeEach(function () {
      let ctrl;
      return ctrl = undefined;
    });

    it('change if selecting', () => {
      let ctrl = getController(handlers);
      ctrl.bankLinkEdit();
      scope.$digest();
      expect(ctrl.selecting).toEqual(false);
    });
  });

  describe('.handleAccountDelete', () => {
    beforeEach(function () {
      let ctrl;
      return ctrl = undefined;
    });

    it('should remove the account from the accounts array', () => {
      let ctrl = getController(handlers);
      let account = ctrl.accounts[0]['_account'];
      ctrl.handleAccountDelete(account);
      scope.$digest();
      expect(ctrl.accounts).toEqual([]);
    });
  });

  describe('.hideWhenNoAccounts', () => {
    beforeEach(function () {
      let ctrl;
      return ctrl = undefined;
    });

    it('should be true when there are no accounts', () => {
      let ctrl = getController(handlers);
      ctrl.accounts = [];
      expect(ctrl.hideWhenNoAccounts).toEqual(true);
    });
  });

  describe('$onChanges', () => {
    beforeEach(function () {
      let ctrl;
      return ctrl = undefined;
    });

    it('should reassign selectedBankAccount', () => {
      let ctrl = getController(handlers);
      ctrl.$onChanges({selectedBankAccount: {currentValue: 'Bank 2'}});
      expect(ctrl.selectedBankAccount).toEqual('Bank 2');
    });
  });
});
