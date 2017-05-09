import HeaderTemplate from './header.pug';

class HeaderDirective {

  constructor () {
    this.restrict = 'E';
    this.replace = true;
    this.scope = {
      navigationItems: '='
    };
    this.template = HeaderTemplate;
  }

  link (scope, element) {
    return element;
  }
}

export default HeaderDirective;
