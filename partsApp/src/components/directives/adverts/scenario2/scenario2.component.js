// Internal resources
import Mocks from './scenario2.mocks.js';
import Template from './scenario2.pug';

class Controller {
  constructor () {
    this.title = Mocks.title;
    this.description = Mocks.description;
  }

  $onInit () {
    console.log('onInit scenario 2');
  }

  $onDestroy () {
    console.log('onDestroy scenario 2');
  }
}

export default {
  controller: Controller,
  template: Template
};
