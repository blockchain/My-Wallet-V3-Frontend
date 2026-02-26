describe('Address Book Entry Directive', () => {
  let $compile;
  let $rootScope;
  let element;
  let isoScope;
  let Wallet;
  let MyWallet;
  
  beforeEach(module('walletDirectives'));

  beforeEach(module('walletApp'));

  beforeEach(inject(function (_$compile_, _$rootScope_, $httpBackend) {
    // TODO: use Wallet mock, so we don't need to mock this $httpBackend call
    $httpBackend.whenGET('/Resources/wallet-options.json').respond();

    $compile = _$compile_;
    $rootScope = _$rootScope_;

  })
  );

  beforeEach(function () {
    element = $compile("<div address-book-entry></div>")($rootScope);
    $rootScope.$digest();
    isoScope = element.isolateScope();
    isoScope.$digest();

    isoScope.address = {};

    return angular.mock.inject(function ($injector, $rootScope, $controller) {
      let Alerts = $injector.get('Alerts');
      Wallet = $injector.get('Wallet');
      MyWallet = $injector.get('MyWallet');

      Alerts.confirm = () => ({then(f) { return f(true); }});

      return MyWallet.wallet = {
        removeAddressBookEntry () {
          let address = 'address';
          return delete MyWallet.wallet.addressBook[address];
        },

        addressBook: {"address": "Satoshi"}
      };});});

  it('has an element that is defined', () => expect(element).toBeDefined());

  it('can delete an address book entry', () => {
    spyOn(Wallet, 'removeAddressBookEntry').and.callThrough();

    isoScope.delete();
    expect(Wallet.removeAddressBookEntry).toHaveBeenCalled();
    expect(MyWallet.wallet.addressBook['address']).toBeUndefined();
  });
});
