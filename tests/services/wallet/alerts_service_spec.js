describe('Alerts', function() {
  let Alerts = undefined;
  let service = undefined;
  let element = undefined;

  beforeEach(angular.mock.module('walletApp'));

  beforeEach(function() {
    angular.mock.inject(function($injector, $translate, $timeout, $compile, $rootScope) {
      Alerts = $injector.get('Alerts');

      element = $compile("<uib-alert></uib-alert>")($rootScope);
      service = {
        alerts: []
      };

      return service.alerts.push(element);
    });

  });

  return describe("close", function() {

    it("should be able to close an alert", function() {
      Alerts.close(element, service.alerts);
      return expect(service.alerts.length).toBe(0);
    });
      
    it("should be able to clear multiple alerts", function() {
      for (let i = 1; i <= 10; i++) {
        service.alerts.push(element);
      }

      Alerts.clear(service.alerts);
      return expect(service.alerts.length).toBe(0);
    });

    return it("should check for duplicates", function() {
      Alerts.clear(service.alerts);

      for (let i = 1; i <= 2; i++) {
        Alerts.display('error', 'error message', false, service.alerts);
      }

      return expect(service.alerts.length).toBe(1);
    });
  });
});
