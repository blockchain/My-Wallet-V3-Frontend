describe('Transaction Note Directive', () => {
  let $compile;
  let $rootScope;
  let element;
  let isoScope;
  let Wallet;

  beforeEach(module('walletDirectives'));
  
  // Load the myApp module, which contains the directive
  beforeEach(module('walletApp'));

  // Store references to $rootScope and $compile
  // so they are available to all tests in this describe block
  beforeEach(inject(function (_$compile_, _$rootScope_, Wallet, $httpBackend) {

    // TODO: use Wallet mock, so we don't need to mock this $httpBackend call
    $httpBackend.whenGET('/Resources/wallet-options.json').respond();

    // The injector unwraps the underscores (_) from around the parameter names when matching
    $compile = _$compile_;
    $rootScope = _$rootScope_;

    Wallet.getLabelledHdAddresses = () => [{'address': '123', 'label': 'label label label fun'}];

    $rootScope.transaction = {
      note: "Hello World",
      processedOutputs: [{'address': '123', 'identity': 1}],
      txType: 'received',
      to: [{accountIndex: 0, receiveIndex: 1}]
    };
    $rootScope.account = 1;

  })
  );

  beforeEach(function () {
    element = $compile("<transaction-note transaction='transaction' account='account'></transaction-note>")($rootScope);
    $rootScope.$digest();
    return isoScope = element.isolateScope();
  });

  it('should have the note in its scope', () => expect(isoScope.transaction.note).toBe("Hello World"));

  it('should show only the note if no address labels match the tx', inject(function (Wallet) {
    Wallet.getLabelledHdAddresses = () => [{'address': '123123123nomatch', 'label': 'label label label fun'}];
    element = $compile("<transaction-note transaction='transaction' account='account'></transaction-note>")($rootScope);
    $rootScope.$digest();
    isoScope = element.isolateScope();
    let addressLabel = element[0].querySelectorAll('.tx-note');
    let txNote = element[0].querySelectorAll('.tx-note');

    expect(element.html().indexOf("label label label fun") === -1).toBe(true);
  })
  );

  it('should show the note over the address label if the tx has both', () => {
    let addressLabel = element[0].querySelectorAll('.tx-note');
    let txNote = element[0].querySelectorAll('.tx-note');
    expect(angular.element(addressLabel).hasClass('ng-hide')).toBe(true);
  });

  it('should save a modified note', inject(function () {
    spyOn(isoScope, 'setNote');
    isoScope.note = "Modified note";
    isoScope.saveNote();
    expect(isoScope.setNote).toHaveBeenCalled();
  })
  );

  it('should delete a note', inject(function (Wallet) {
    isoScope.note = null;
    spyOn(isoScope, 'deleteNote');
    isoScope.removeNote();
    expect(isoScope.deleteNote).toHaveBeenCalled();
  })
  );

  it('does cancel edit note', () => {
    isoScope.cancelEditNote();
    expect(isoScope.draftNote).toBe("");
    expect(isoScope.editNote).toBe(false);
  });

  it('does start edit note', () => {
    isoScope.startEditNote();
    expect(isoScope.draftNote).toBe(isoScope.note);
    expect(isoScope.editNote).toBe(true);
  });

  it('does save note', () => {
    isoScope.saveNote();
    expect(isoScope.draftNote).toBe(isoScope.note);
    expect(isoScope.editNote).toBe(false);
  });

});
