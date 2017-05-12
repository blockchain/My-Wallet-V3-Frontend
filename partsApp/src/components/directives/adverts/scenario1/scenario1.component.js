// Internal resources
import Mocks from './scenario1.mocks.js';
import Template from './scenario1.pug';

class Controller {
  constructor () {
    this.title = Mocks.title;
    this.description = Mocks.description;
  }

  $onInit () {
    console.log('onInit scenario 1');
  }

  $onDestroy () {
    console.log('onDestroy scenario 1');
  }
}

export default {
  controller: Controller,
  template: Template
};
