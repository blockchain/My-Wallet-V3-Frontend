describe('ModalNotificationCtrl', () => {
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
    angular.mock.inject(function ($injector, $rootScope, $controller) {

      scope = $rootScope.$new();

      $controller('ModalNotificationCtrl', {
        $scope: scope,
        $uibModalInstance: modalInstance,
        notification: {
          type: '',
          icon: '',
          heading: "Title",
          msg: "Message"
        }
      });

      scope.$digest();

    });

  });

  it('should display the notification', () => {
    expect(scope.notification.msg).toEqual("Message");
  });

  it('should be dismissed', () => {
    spyOn(modalInstance, 'close');
    scope.ok();
    expect(modalInstance.close).toHaveBeenCalled();
  });
});
