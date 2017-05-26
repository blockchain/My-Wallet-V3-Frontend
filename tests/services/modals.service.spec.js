describe('modals', () => {
  let modals;
  let $uibModal;

  beforeEach(angular.mock.module('walletApp'));

  beforeEach(() =>
    angular.mock.inject(function ($injector, _$rootScope_, _$q_) {
      modals = $injector.get('modals');
      return $uibModal = $injector.get('$uibModal');
    })
  );

  let modalOpener = () => $uibModal.open({templateUrl: "<div>modal</div>"});

  describe('openOnce', () =>
    it('should prevent a second modal from opening', () => {
      spyOn($uibModal, "open").and.callThrough();
      let open = modals.openOnce(modalOpener);
      open();
      expect($uibModal.open).toHaveBeenCalledTimes(1);
      open();
      expect($uibModal.open).toHaveBeenCalledTimes(1);
    })
  );

  describe('dismissPrevious', () =>
    it('should dismiss the first modal when opening a second one', () => {
      let instanceMock = {dismiss: jasmine.createSpy()};
      spyOn($uibModal, "open").and.returnValue(instanceMock);
      let open = modals.dismissPrevious(modalOpener);
      open();
      expect(instanceMock.dismiss).not.toHaveBeenCalled();
      expect($uibModal.open).toHaveBeenCalledTimes(1);
      open();
      expect(instanceMock.dismiss).toHaveBeenCalledTimes(1);
      expect($uibModal.open).toHaveBeenCalledTimes(2);
    })
  );
});
