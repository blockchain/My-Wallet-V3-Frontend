describe 'Alerts', () ->
  Alerts = undefined
  service = undefined
  element = undefined

  beforeEach(angular.mock.module('walletApp'));

  beforeEach ->
    angular.mock.inject ($injector, $translate, $timeout, $compile, $rootScope) ->
      Alerts = $injector.get('Alerts')

      element = $compile("<uib-alert></uib-alert>")($rootScope)
      service = {
        alerts: []
      }

      service.alerts.push(element)

    return

  describe "close", ->

    it "should be able to close an alert", ->
      Alerts.close(element, service.alerts)
      expect(service.alerts.length).toBe(0)
      
    it "should be able to clear multiple alerts", ->
      for i in [1..10]
        service.alerts.push(element)

      Alerts.clear(service.alerts)
      expect(service.alerts.length).toBe(0)

    it "should check for duplicates", ->
      Alerts.clear(service.alerts)

      for i in [1..2]
        Alerts.display('error', 'error message', false, service.alerts)

      expect(service.alerts.length).toBe(1)
