describe('exchange-verify.component', () => {
  let scope;
  let $rootScope;
  $rootScope = undefined;
  let $compile;
  let $templateCache;
  let $componentController;

  let steps = ['address'];
  let fields = ['fullName', 'mobile', 'pancard', 'address', 'pincode', 'state'];
  let onVerify = () => { return true; };
  let onSetProfile = () => { return true; };
  let exchange = {
    constructor: {
      name: 'Unocoin'
    }
  };
  let qa = {
    unocoin: {
      info () { return true; },
      address () { return true; }
    }
  };

  let handlers = {
    steps,
    fields,
    onVerify,
    onSetProfile,
    exchange,
    qa
  };

  let getController = function (bindings) {
    scope = $rootScope.$new();
    let ctrl = $componentController('exchangeVerify', {$scope: scope}, bindings);
    let template = $templateCache.get('templates/exchange/verify.pug');
    $compile(template)(scope);
    return ctrl;
  };

  beforeEach(module('walletApp'));
  beforeEach(() =>
    angular.mock.inject(function ($injector, _$rootScope_, _$compile_, _$templateCache_, _$componentController_, $httpBackend, _$q_) {
      $rootScope = _$rootScope_;
      $compile = _$compile_;
      $templateCache = _$templateCache_;
      $componentController = _$componentController_;
      $httpBackend.whenGET('/Resources/wallet-options.json').respond();
    })
  );

  describe('showField()', () => {
    it('should return true if the field is present', () => {
      let ctrl = getController(handlers);
      expect(ctrl.showField('mobile')).toBe(true);
    });
  });

  describe('setProfile()', () => {
    it('should call onSetProfile', () => {
      let ctrl = getController(handlers);
      spyOn(ctrl, 'onSetProfile');
      ctrl.setProfile();
      expect(ctrl.onSetProfile).toHaveBeenCalled();
    });
  });

  describe('isBeforeNow', () => {
    beforeEach(function () {
      let mockNow = new Date('11/24/2016').getTime();
      return spyOn(Date, 'now').and.returnValue(mockNow);
    });

    it('should return true if date is in past', () => {
      let ctrl = getController(handlers);
      let past = '11/23/2016';
      return expect(ctrl.isBeforeNow(past)).toEqual(true);
    });

    it('should return false if date is in future', () => {
      let ctrl = getController(handlers);
      let future = '11/25/2016';
      return expect(ctrl.isBeforeNow(future)).toEqual(false);
    });
  });
});
