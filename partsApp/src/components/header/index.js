import angular from 'npm/angular';
import uiRouter from 'npm/angular-ui-router';
import ngResource from 'npm/angular-resource';

import HeaderDirective from './header.directive.js';

const modules = [
  uiRouter,
  ngResource
];

export default angular
  .module('app.components.header', modules)
  .directive('headerDirective', () => new HeaderDirective())
  .name;
