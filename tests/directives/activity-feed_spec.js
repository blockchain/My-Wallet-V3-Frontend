describe('Activity Feed directive', () => {
  let $compile;
  let $rootScope;
  let scope;

  beforeEach(module('walletDirectives'));

  beforeEach(module('walletApp'));

  beforeEach(inject((_$compile_, _$rootScope_, $injector) => {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    let $httpBackend = $injector.get('$httpBackend');
    scope = $rootScope.$new();

    let MyWallet = $injector.get('MyWallet');

    $httpBackend.whenGET('/Resources/wallet-options.json').respond();

    MyWallet.wallet = {
      hdwallet: {
        accounts: [{ archived: false }, { archived: false }, { archived: true }]
      },
      status: {didLoadTransactions: false},
      txList: {
        subscribe () { return () => {}; }
      },
      eth: {
        defaultAccount: {
          txs: []
        }
      }
    };

    let Activity = $injector.get('Activity');
    Activity.activity = { activities: [], transactions: [], logs: [], limit: 8 };
  }));

  beforeEach(function () {
    $compile('<div><activity-feed></activity-feed></div>')($rootScope);
    $rootScope.$digest();
    scope.$apply();
  });

  it('has an initial loading state of true', () => {
    expect(scope.loading).toBe(true);
  });

  it('has no loading state once transactions have loaded', () => {
    // need to stub out the Activity service
    scope.status.didLoadTransactions = true;
    scope.$apply();
    expect(scope.loading).toBe(false);
  });
});
