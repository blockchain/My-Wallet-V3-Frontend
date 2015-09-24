describe("AlertsCtrl", () => {
  var scope;

  beforeEach(() => {
    angular.mock.inject(($injector, $rootScope, $controller) => {
      var Wallet = $injector.get("Wallet");
      scope = $rootScope.$new();
      $controller("AlertsCtrl", {
        $scope: scope,
        $stateParams: {}
      });
    });
  });

  it("should have access to wallet alerts", inject(() => {
    expect(scope.alerts).toBeDefined();
  }));
});
