// Internal resources
import Template from './leftNavbar.pug';

class Controller {
  constructor () {
    this.closed = true;
  }

  click () {
    this.closed = !this.closed;
  }

  toggleCollapse () {
    this.closed = true;
  }
}

export default {
  controller: Controller,
  template: Template,
  bindings: {
    menuLinks: '<'
  }
};
