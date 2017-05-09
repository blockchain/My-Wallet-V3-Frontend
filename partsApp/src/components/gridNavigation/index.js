import angular from 'npm/angular';
import uiRouter from 'npm/angular-ui-router';
import ngResource from 'npm/angular-resource';

import GridNavigationDirective from './gridNavigation.directive.js';

const modules = [
  uiRouter,
  ngResource
];

export default angular
  .module('app.components.gridNavigation', modules)
  .directive('gridNavigationDirective', () => new GridNavigationDirective())
  .name;
