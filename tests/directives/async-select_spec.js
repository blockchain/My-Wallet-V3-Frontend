describe('async select', function () {
  let $q;
  let isoScope;

  beforeEach(module('walletApp'));

  beforeEach(inject(function (_$compile_, _$rootScope_, _$q_) {
    let $compile = _$compile_;
    let $rootScope = _$rootScope_;
    $q = _$q_;

    let element = $compile('<async-select></async-select>')($rootScope);
    $rootScope.$digest();
    isoScope = element.isolateScope();
    return isoScope.$digest();
  })
  );

  describe('didSelect', function () {
    let mockPromise = err =>
      ({
        then(f) {
          !err && f();
          return {
            catch(g) {
              err && g();
              return {finally(h) { return h(); }};
            }
          };
        }
      })
    ;

    beforeEach(() => isoScope.selected = { name: 'U.S. Dollar', code: 'USD' });

    it('should change successfully', function () {
      let item = { name: 'Other Name', code: 'Not USD' };
      isoScope.onChange = jasmine.createSpy().and.returnValue(mockPromise());
      isoScope.didSelect(item);
      expect(isoScope.onChange).toHaveBeenCalledWith(item);
      expect(isoScope.selected.code).toEqual('Not USD');
    });

    it('should show an error when on failure', inject(function (Alerts) {
      spyOn(Alerts, 'displayError');
      isoScope.onChange = jasmine.createSpy().and.returnValue(mockPromise(true));
      isoScope.didSelect({ name: 'Other Name', code: 'Not USD' });
      expect(isoScope.selected.code).toEqual('USD');
      expect(Alerts.displayError).toHaveBeenCalled();
    })
    );

    it('should set changing to false when async operation is complete', function () {
      isoScope.onChange = jasmine.createSpy().and.returnValue(mockPromise());
      isoScope.changing = true;
      isoScope.didSelect();
      expect(isoScope.changing).toEqual(false);
    });
  });

  describe('displayItem', function () {
    let item = { name: 'U.S. Dollar', code: 'USD' };

    it('should return a blank string if no item is given', () => expect(isoScope.displayItem()).toEqual(''));

    it('should display an item using the display prop', function () {
      isoScope.displayProp = 'name';
      expect(isoScope.displayItem(item)).toEqual('U.S. Dollar');
    });

    it('should display an item using the optional display prop', function () {
      isoScope.displayProp = 'name';
      isoScope.displayOptional = 'code';
      expect(isoScope.displayItem(item, true)).toEqual('U.S. Dollar (USD)');
    });

    it('should not display the optional display prop if flag is false', function () {
      isoScope.displayProp = 'name';
      isoScope.displayOptional = 'code';
      expect(isoScope.displayItem(item, false)).toEqual('U.S. Dollar');
    });
  });
});
