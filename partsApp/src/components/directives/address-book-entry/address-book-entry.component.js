import Template from './address-book-entry.pug';

class Controller {

  constructor ($scope, $injector, $stateParams) {
    this.title = 'Activity Feed';
    this.scenarioLinks =
    [
      { title: 'Scenario 1', description: 'This should display one address.', href: 'address-book-entry({scenarioId:1})' },
    ];
  }
}

export default {
  controller: Controller,
  template: Template
};
