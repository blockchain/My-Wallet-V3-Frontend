describe('Transaction Note Directive', () => {
  let $compile;
  let $rootScope;
  let element;
  let isoScope;
  let Wallet;

  // Load the myApp module, which contains the directive
  beforeEach(module('walletApp'));

  // Store references to $rootScope and $compile
  // so they are available to all tests in this describe block
  beforeEach(inject(function (_$compile_, _$rootScope_, Wallet) {

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

  it("should show the note", () => expect(element.html()).toContain("Hello World"));

  it("should have the note in its scope", () => expect(isoScope.transaction.note).toBe("Hello World"));

  it("should show only the note if no address labels match the tx", inject(function (Wallet) {
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

  it("should show the label if it is associated with an address in the tx and there is no tx note", inject(function (Wallet) {
    spyOn(Wallet, 'deleteNote');
    isoScope.deleteNote();
    isoScope.$digest();

    let addressLabel = element[0].querySelectorAll('.tx-note');
    expect(angular.element(addressLabel).hasClass('ng-hide')).toBe(false);
  })
  );

  it("should show a label when All wallets are filtered", inject(function (Wallet) {
    $rootScope.account = '';
    spyOn(Wallet, 'deleteNote');
    isoScope.deleteNote();
    element = $compile("<transaction-note transaction='transaction' account='account'></transaction-note>")($rootScope);
    $rootScope.$digest();

    let addressLabel = element[0].querySelectorAll('.tx-note');
    expect(angular.element(addressLabel).hasClass('ng-hide')).toBe(false);
  })
  );

  it("should save a modified note", inject(function (Wallet) {
    spyOn(Wallet, 'setNote');
    isoScope.transaction.note = "Modified note";
    isoScope.$digest();
    expect(Wallet.setNote).toHaveBeenCalled();
  })
  );

  it("should not save an unmodified note", inject(function (Wallet) {
    spyOn(Wallet, 'setNote');
    isoScope.$digest();
    expect(Wallet.setNote).not.toHaveBeenCalled();
  })
  );

  it("should create a new note", inject(function (Wallet) {
    isoScope.transaction.note = null;

    spyOn(Wallet, 'setNote');

    isoScope.transaction.note = "New note";
    isoScope.$digest();

    expect(Wallet.setNote).toHaveBeenCalled();
  })
  );

  it("should delete a note", inject(function (Wallet) {
    isoScope.transaction.note = null;

    spyOn(Wallet, 'deleteNote');

    isoScope.$digest();

    expect(Wallet.deleteNote).toHaveBeenCalled();
  })
  );


  it("should delete a note if it's an empty string", inject(function (Wallet) {
    isoScope.transaction.note = "";

    spyOn(Wallet, 'deleteNote');

    isoScope.$digest();

    expect(Wallet.deleteNote).toHaveBeenCalled();
  })
  );

  it('does cancel edit note', () => {
    isoScope.cancelEditNote();
    expect(isoScope.transaction.draftNote).toBe("");
    expect(isoScope.editNote).toBe(false);
  });

  it('does start edit note', () => {
    isoScope.startEditNote();
    expect(isoScope.transaction.draftNote).toBe(isoScope.transaction.note);
    expect(isoScope.editNote).toBe(true);
  });

  it('does save note', () => {
    isoScope.saveNote();
    expect(isoScope.transaction.draftNote).toBe(isoScope.transaction.note);
    expect(isoScope.editNote).toBe(false);
  });

  it('does delete note', () => {
    isoScope.deleteNote();
    expect(isoScope.transaction.note).toBe(null);
    expect(isoScope.editNote).toBe(false);
  });

});
