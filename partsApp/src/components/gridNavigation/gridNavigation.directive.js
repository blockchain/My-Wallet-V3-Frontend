import GridNavigationTemplate from './gridNavigation.pug';

class GridNavigationDirective {

  constructor () {
    this.restrict = 'E';
    this.replace = true;
    this.scope = {
      gridItems: '='
    };
    this.template = GridNavigationTemplate;
  }

  link (scope, element) {
    return element;
  }
}

export default GridNavigationDirective;
