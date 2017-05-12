import nav from './adverts.nav.js';
import Template from './adverts.pug';

class Controller {
  constructor () {
    this.scenarios = nav.scenarioLinks;


  }
}

export default {
  controller: Controller,
  template: Template,
  bindings: {
    title: '<',
    scenarioLinks: '<'
  }
};
